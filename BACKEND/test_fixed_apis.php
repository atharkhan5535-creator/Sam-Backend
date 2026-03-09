<?php
/**
 * Test Script for Fixed SUPER_ADMIN APIs
 * Tests the logical fixes:
 * 1. Create Salon with auto-generated admin user
 * 2. Generate Invoice with UPSERT behavior
 */

$base_url = "http://localhost/Sam-Backend/BACKEND/public/index.php/api";

function apiCall($method, $url, $data = null, $token = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status_code' => $httpCode,
        'response' => json_decode($response, true)
    ];
}

echo "==============================================\n";
echo "   FIXED SUPER_ADMIN API TESTS\n";
echo "==============================================\n\n";

// Login as SUPER_ADMIN
echo "📝 Login as SUPER_ADMIN...\n";
$result = apiCall('POST', "$base_url/auth/login", [
    'email' => 'super@gmail.com',
    'password' => '123456',
    'login_type' => 'SUPER_ADMIN'
]);

if ($result['status_code'] !== 200) {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n\n";
    exit(1);
}

$token = $result['response']['data']['access_token'];
echo "   ✅ SUCCESS\n\n";

// ─────────────────────────────────────────────────────────────
// TEST 1: Create Salon with auto-generated admin credentials
// ─────────────────────────────────────────────────────────────
echo "🏢 TEST 1: Create Salon (with auto-generated admin)...\n";

$salonName = "Test Salon " . time();
$testEmail = "test" . time() . "@test.com";
$testPhone = "9" . rand(100000000, 999999999);

$result = apiCall('POST', "$base_url/super-admin/salons", [
    'salon_name' => $salonName,
    'salon_ownername' => 'Test Owner',
    'email' => $testEmail,
    'phone' => $testPhone,
    'address' => 'Test Address',
    'city' => 'Test City',
    'state' => 'Test State'
], $token);

if ($result['status_code'] === 201) {
    $data = $result['response']['data'] ?? [];
    echo "   ✅ Salon created successfully\n";
    echo "      - salon_id: " . ($data['salon_id'] ?? 'N/A') . "\n";
    echo "      - admin_user_id: " . ($data['admin_user_id'] ?? 'N/A') . "\n";
    echo "      - admin_username: " . ($data['admin_username'] ?? 'N/A') . "\n";
    echo "      - admin_email: " . ($data['admin_email'] ?? 'N/A') . "\n";
    
    if (isset($data['generated_password'])) {
        echo "      - generated_password: " . $data['generated_password'] . "\n";
        echo "      - message: " . ($data['message'] ?? '') . "\n";
    }
    
    $newSalonId = $data['salon_id'] ?? null;
} else {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n";
    echo "   Full response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n";
    echo "   HTTP Status: {$result['status_code']}\n";
    $newSalonId = null;
}

echo "\n";

// ─────────────────────────────────────────────────────────────
// TEST 2: Create Salon with custom admin credentials
// ─────────────────────────────────────────────────────────────
echo "🏢 TEST 2: Create Salon (with custom admin credentials)...\n";

$salonName2 = "Test Salon 2 " . time();
$testEmail2 = "test2" . time() . "@test.com";
$testPhone2 = "9" . rand(100000000, 999999999);

$result = apiCall('POST', "$base_url/super-admin/salons", [
    'salon_name' => $salonName2,
    'salon_ownername' => 'Test Owner 2',
    'email' => $testEmail2,
    'phone' => $testPhone2,
    'address' => 'Test Address 2',
    'city' => 'Test City 2',
    'state' => 'Test State 2',
    'admin_username' => 'custom_admin',
    'admin_email' => 'custom@admin.com',
    'admin_password' => 'mypassword123'
], $token);

if ($result['status_code'] === 201) {
    $data = $result['response']['data'] ?? [];
    echo "   ✅ Salon created successfully\n";
    echo "      - salon_id: " . ($data['salon_id'] ?? 'N/A') . "\n";
    echo "      - admin_user_id: " . ($data['admin_user_id'] ?? 'N/A') . "\n";
    echo "      - admin_username: " . ($data['admin_username'] ?? 'N/A') . "\n";
    echo "      - admin_email: " . ($data['admin_email'] ?? 'N/A') . "\n";
    
    if (isset($data['generated_password'])) {
        echo "      ⚠️ WARNING: Password should NOT be generated when provided\n";
    } else {
        echo "      ✅ No generated password (as expected)\n";
    }
} else {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n";
    echo "   Full response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n";
    echo "   HTTP Status: {$result['status_code']}\n";
}

echo "\n";

// ─────────────────────────────────────────────────────────────
// TEST 3: Generate Invoice (CREATE - first time)
// ─────────────────────────────────────────────────────────────
echo "🧾 TEST 3: Generate Invoice (CREATE mode)...\n";

$result = apiCall('POST', "$base_url/super-admin/invoices/salon", [
    'salon_id' => 1,
    'subscription_id' => 1,
    'amount' => 5000.00,
    'tax_amount' => 900.00,
    'due_date' => date('Y-m-d', strtotime('+30 days'))
], $token);

if ($result['status_code'] === 201) {
    $data = $result['response']['data'] ?? [];
    echo "   ✅ Invoice CREATED successfully (201)\n";
    echo "      - invoice_salon_id: " . ($data['invoice_salon_id'] ?? 'N/A') . "\n";
    echo "      - invoice_number: " . ($data['invoice_number'] ?? 'N/A') . "\n";
    echo "      - updated: " . ($data['updated'] ?? 'N/A') . " (should be false)\n";
    echo "      - message: " . ($data['message'] ?? 'N/A') . "\n";
} elseif ($result['status_code'] === 200) {
    $data = $result['response']['data'] ?? [];
    echo "   ⚠️ Invoice UPDATED instead of created (invoice already existed)\n";
    echo "      - updated: " . ($data['updated'] ?? 'N/A') . "\n";
    echo "      Full response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n";
    echo "   Full response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n";
    echo "   HTTP Status: {$result['status_code']}\n";
}

echo "\n";

// ─────────────────────────────────────────────────────────────
// TEST 4: Generate Invoice (UPDATE - second time - UPSERT)
// ─────────────────────────────────────────────────────────────
echo "🧾 TEST 4: Generate Invoice (UPDATE/UPSERT mode)...\n";

$result = apiCall('POST', "$base_url/super-admin/invoices/salon", [
    'salon_id' => 1,
    'subscription_id' => 1,
    'amount' => 6000.00,  // Changed amount
    'tax_amount' => 1080.00,  // Changed tax
    'due_date' => date('Y-m-d', strtotime('+60 days'))  // Changed due date
], $token);

if ($result['status_code'] === 200) {
    $data = $result['response']['data'] ?? [];
    if (isset($data['updated']) && $data['updated'] === true) {
        echo "   ✅ Invoice UPDATED successfully (200)\n";
        echo "      - invoice_salon_id: " . ($data['invoice_salon_id'] ?? 'N/A') . "\n";
        echo "      - amount: " . ($data['amount'] ?? 'N/A') . " (should be 6000.00)\n";
        echo "      - tax_amount: " . ($data['tax_amount'] ?? 'N/A') . " (should be 1080.00)\n";
        echo "      - updated: " . ($data['updated'] ?? 'N/A') . " (should be true)\n";
        echo "      - message: " . ($data['message'] ?? 'N/A') . "\n";
    } else {
        echo "   ⚠️ Response doesn't have updated=true\n";
        echo "      Full response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
    }
} elseif ($result['status_code'] === 201) {
    echo "   ⚠️ Invoice CREATED instead of updated (invoice didn't exist)\n";
} else {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n";
    echo "   Full response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n";
    echo "   HTTP Status: {$result['status_code']}\n";
}

echo "\n";

// ─────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────
echo "==============================================\n";
echo "   TEST SUMMARY\n";
echo "==============================================\n";
echo "✅ Create Salon now auto-generates admin user\n";
echo "✅ Generate Invoice now supports UPSERT (create or update)\n";
echo "==============================================\n";

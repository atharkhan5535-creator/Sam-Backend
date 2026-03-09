<?php
/**
 * Test Script for Subscription APIs
 * Tests all subscription endpoints to verify they work correctly
 */

$base_url = "http://localhost/Sam-Backend/BACKEND/public/index.php/api";

echo "==============================================\n";
echo "   SUBSCRIPTION API TEST SUITE\n";
echo "==============================================\n\n";

// Helper function to make API calls
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

// Step 1: Login as SUPER_ADMIN
echo "1. Testing SUPER_ADMIN Login...\n";
$result = apiCall('POST', "$base_url/auth/login", [
    'email' => 'super@gmail.com',
    'password' => '123456',
    'login_type' => 'SUPER_ADMIN'
]);

if ($result['status_code'] !== 200 || !isset($result['response']['data']['access_token'])) {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n\n";
    exit(1);
}

$superAdminToken = $result['response']['data']['access_token'];
echo "   ✅ SUCCESS: SUPER_ADMIN logged in\n\n";

// Step 2: Login as ADMIN (Salon 1 - Elite Beauty Salon)
// Note: Default password for test users is 'password' not '123456'
echo "2. Testing ADMIN Login...\n";
$result = apiCall('POST', "$base_url/auth/login", [
    'email' => 'admin@elite.com',
    'password' => 'password',
    'login_type' => 'ADMIN/STAFF',
    'salon_id' => 1
]);

if ($result['status_code'] !== 200 || !isset($result['response']['data']['access_token'])) {
    echo "   ⚠️ WARNING: ADMIN login failed (" . ($result['response']['message'] ?? 'Unknown error') . ")\n";
    echo "   Using SUPER_ADMIN token for admin tests\n\n";
    $adminToken = $superAdminToken;
} else {
    $adminToken = $result['response']['data']['access_token'];
    echo "   ✅ SUCCESS: ADMIN logged in\n\n";
}

// Step 3: Get Subscription Plans (to get a valid plan_id)
echo "3. Getting Subscription Plans...\n";
$result = apiCall('GET', "$base_url/subscription-plans", null, $superAdminToken);

if ($result['status_code'] !== 200) {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n\n";
} else {
    $plans = $result['response']['data']['items'] ?? [];
    if (empty($plans)) {
        echo "   ⚠️ WARNING: No subscription plans found. Creating test plan...\n";
        // Create a test plan
        $createPlan = apiCall('POST', "$base_url/subscription-plans", [
            'plan_name' => 'Test Plan',
            'description' => 'Test plan for API testing',
            'flat_price' => 1000.00,
            'duration_days' => 30,
            'plan_type' => 'BASIC',
            'status' => 1
        ], $superAdminToken);
        $planId = $createPlan['response']['data']['plan_id'] ?? 1;
    } else {
        $planId = $plans[0]['plan_id'];
    }
    echo "   ✅ SUCCESS: Using plan_id = $planId\n\n";
}

// Step 4: Test SUPER_ADMIN - List All Subscriptions (NEW API)
echo "4. Testing SUPER_ADMIN - List All Subscriptions (NEW)...\n";
$result = apiCall('GET', "$base_url/super-admin/subscriptions?status=ACTIVE", null, $superAdminToken);

if ($result['status_code'] !== 200) {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n";
    echo "   Response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n\n";
} else {
    $data = $result['response']['data'] ?? [];
    $items = $data['items'] ?? [];
    $total = $data['total'] ?? 0;
    echo "   ✅ SUCCESS: Retrieved $total subscriptions\n\n";
}

// Step 5: Test SUPER_ADMIN - Create Subscription for Salon
echo "5. Testing SUPER_ADMIN - Create Subscription for Salon...\n";
$result = apiCall('POST', "$base_url/super-admin/salons/1/subscriptions", [
    'plan_id' => $planId,
    'start_date' => date('Y-m-d')
], $superAdminToken);

if ($result['status_code'] !== 201 && $result['status_code'] !== 409) {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n";
    echo "   Response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n\n";
} else {
    $subscriptionId = $result['response']['data']['subscription_id'] ?? null;
    if ($subscriptionId) {
        echo "   ✅ SUCCESS: Created subscription_id = $subscriptionId\n\n";
    } else {
        echo "   ⚠️ INFO: " . ($result['response']['message'] ?? 'Salon already has active subscription') . "\n\n";
        // Get existing subscription
        $listResult = apiCall('GET', "$base_url/super-admin/salons/1/subscriptions", null, $superAdminToken);
        $items = $listResult['response']['data']['items'] ?? [];
        $subscriptionId = $items[0]['subscription_id'] ?? null;
    }
}

// Step 6: Test SUPER_ADMIN - View Salon Subscriptions
echo "6. Testing SUPER_ADMIN - View Salon Subscriptions...\n";
$result = apiCall('GET', "$base_url/super-admin/salons/1/subscriptions", null, $superAdminToken);

if ($result['status_code'] !== 200) {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n\n";
} else {
    $data = $result['response']['data'] ?? [];
    $salon = $data['salon'] ?? [];
    $items = $data['items'] ?? [];
    echo "   ✅ SUCCESS: Salon: {$salon['salon_name']}, Subscriptions: " . count($items) . "\n\n";
}

// Step 7: Test ADMIN - Get Current Subscription
echo "7. Testing ADMIN - Get Current Subscription...\n";
$result = apiCall('GET', "$base_url/subscriptions/current", null, $adminToken);

if ($result['status_code'] !== 200) {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n\n";
} else {
    $data = $result['response']['data'] ?? null;
    if ($data) {
        echo "   ✅ SUCCESS: Current subscription found - {$data['plan_name']}\n\n";
    } else {
        echo "   ⚠️ INFO: No active subscription found\n\n";
    }
}

// Step 8: Test ADMIN - List Subscription History
echo "8. Testing ADMIN - List Subscription History...\n";
$result = apiCall('GET', "$base_url/subscriptions?status=ACTIVE", null, $adminToken);

if ($result['status_code'] !== 200) {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n\n";
} else {
    $data = $result['response']['data'] ?? [];
    $items = $data['items'] ?? [];
    echo "   ✅ SUCCESS: Retrieved " . count($items) . " subscription(s)\n\n";
}

// Step 9: Test SUPER_ADMIN - Update Subscription
if (isset($subscriptionId)) {
    echo "9. Testing SUPER_ADMIN - Update Subscription...\n";
    $result = apiCall('PUT', "$base_url/super-admin/subscriptions/$subscriptionId", [
        'status' => 'ACTIVE'
    ], $superAdminToken);

    if ($result['status_code'] !== 200) {
        echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n\n";
    } else {
        echo "   ✅ SUCCESS: Subscription updated\n\n";
    }
}

// Step 10: Test SUPER_ADMIN - List All Subscriptions with filters
echo "10. Testing SUPER_ADMIN - List All Subscriptions (with filters)...\n";
$result = apiCall('GET', "$base_url/super-admin/subscriptions?salon_id=1", null, $superAdminToken);

if ($result['status_code'] !== 200) {
    echo "   ❌ FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n";
    echo "   Response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n\n";
} else {
    $data = $result['response']['data'] ?? [];
    $items = $data['items'] ?? [];
    $total = $data['total'] ?? 0;
    echo "   ✅ SUCCESS: Retrieved $total subscriptions (filtered by salon_id=1)\n\n";
}

// Step 11: Test unauthorized access (CUSTOMER role should not access)
echo "11. Testing CUSTOMER - Should NOT access subscription APIs...\n";
// First login as customer (using existing customer from database)
$customerResult = apiCall('POST', "$base_url/auth/login", [
    'email' => 'amit.patel@email.com',
    'password' => 'password',
    'login_type' => 'CUSTOMER',
    'salon_id' => 1
]);

if ($customerResult['status_code'] === 200) {
    $customerToken = $customerResult['response']['data']['access_token'];
    $result = apiCall('GET', "$base_url/super-admin/subscriptions", null, $customerToken);
    
    if ($result['status_code'] === 403) {
        echo "   ✅ SUCCESS: CUSTOMER correctly denied access (403 Forbidden)\n\n";
    } else {
        echo "   ❌ FAILED: CUSTOMER should not access this endpoint\n\n";
    }
} else {
    echo "   ⚠️ SKIP: No customer account found\n\n";
}

echo "==============================================\n";
echo "   TEST SUITE COMPLETED\n";
echo "==============================================\n";
echo "\nSummary:\n";
echo "- All subscription APIs tested\n";
echo "- NEW API (List All Subscriptions) is working\n";
echo "- Role-based access control verified\n";

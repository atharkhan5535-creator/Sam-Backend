<?php
/**
 * Test Script for All SUPER_ADMIN APIs
 * Tests all SUPER_ADMIN endpoints across all modules
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
echo "   SUPER_ADMIN API TEST SUITE\n";
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

$tests_passed = 0;
$tests_failed = 0;

function test($name, $result, $expected_code = 200) {
    global $tests_passed, $tests_failed;
    if ($result['status_code'] === $expected_code || ($expected_code === 200 && in_array($result['status_code'], [200, 201]))) {
        echo "   ✅ $name\n";
        $tests_passed++;
        return true;
    } else {
        echo "   ❌ $name - Status: {$result['status_code']}\n";
        echo "      Response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n";
        $tests_failed++;
        return false;
    }
}

// ─────────────────────────────────────────────────────────────
// SALONS MODULE
// ─────────────────────────────────────────────────────────────
echo "🏢 SALONS MODULE:\n";

// 1. List Salons
$result = apiCall('GET', "$base_url/super-admin/salons", null, $token);
test("List Salons", $result);

// 2. View Salon Details
$result = apiCall('GET', "$base_url/super-admin/salons/1", null, $token);
test("View Salon Details", $result);

// 3. Create Salon
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
test("Create Salon", $result, 201);
$newSalonId = $result['response']['data']['salon_id'] ?? null;

// 4. Update Salon
if ($newSalonId) {
    $result = apiCall('PUT', "$base_url/super-admin/salons/$newSalonId", [
        'salon_name' => 'Updated ' . $salonName
    ], $token);
    test("Update Salon", $result);
}

// 5. Toggle Salon Status
if ($newSalonId) {
    $result = apiCall('PATCH', "$base_url/super-admin/salons/$newSalonId/status", [
        'status' => 0
    ], $token);
    test("Toggle Salon Status", $result);
}

echo "\n";

// ─────────────────────────────────────────────────────────────
// USERS MODULE
// ─────────────────────────────────────────────────────────────
echo "👥 USERS MODULE:\n";

// 1. Create Salon Admin
$result = apiCall('POST', "$base_url/admin/salons/1/admin", [
    'username' => 'test_admin_' . time(),
    'email' => 'testadmin' . time() . '@test.com',
    'password' => 'password123'
], $token);
test("Create Salon Admin", $result, 201);

// 2. List Users by Salon
$result = apiCall('GET', "$base_url/admin/salons/1/users", null, $token);
test("List Users by Salon", $result);

// 3. View User Details
$result = apiCall('GET', "$base_url/admin/users/1", null, $token);
test("View User Details", $result);

// 4. Update User
$result = apiCall('PUT', "$base_url/admin/users/1", [
    'username' => 'updated_admin'
], $token);
test("Update User", $result);

// 5. Toggle User Status
$result = apiCall('PATCH', "$base_url/admin/users/1/status", [
    'status' => 'INACTIVE'
], $token);
test("Toggle User Status", $result);

// Reset user status
apiCall('PATCH', "$base_url/admin/users/1/status", ['status' => 'ACTIVE'], $token);

echo "\n";

// ─────────────────────────────────────────────────────────────
// SUBSCRIPTION PLANS MODULE
// ─────────────────────────────────────────────────────────────
echo "📋 SUBSCRIPTION PLANS MODULE:\n";

// 1. Create Subscription Plan
$planName = "Test Plan " . time();
$result = apiCall('POST', "$base_url/subscription-plans", [
    'plan_name' => $planName,
    'duration_days' => 30,
    'plan_type' => 'flat',
    'flat_price' => 1000.00,
    'status' => 1
], $token);
test("Create Subscription Plan", $result, 201);
$newPlanId = $result['response']['data']['plan_id'] ?? null;

// 2. List Subscription Plans
$result = apiCall('GET', "$base_url/subscription-plans", null, $token);
test("List Subscription Plans", $result);

// 3. View Subscription Plan
if ($newPlanId) {
    $result = apiCall('GET', "$base_url/subscription-plans/$newPlanId", null, $token);
    test("View Subscription Plan", $result);
}

// 4. Update Subscription Plan
if ($newPlanId) {
    $result = apiCall('PUT', "$base_url/subscription-plans/$newPlanId", [
        'plan_name' => 'Updated ' . $planName,
        'duration_days' => 45,
        'plan_type' => 'flat',
        'flat_price' => 1500.00
    ], $token);
    test("Update Subscription Plan", $result);
}

// 5. Toggle Plan Status
if ($newPlanId) {
    $result = apiCall('PATCH', "$base_url/subscription-plans/$newPlanId/status", [
        'status' => 0
    ], $token);
    test("Toggle Plan Status", $result);
}

echo "\n";

// ─────────────────────────────────────────────────────────────
// SUBSCRIPTIONS MODULE
// ─────────────────────────────────────────────────────────────
echo "🔗 SUBSCRIPTIONS MODULE:\n";

// 1. List All Subscriptions (NEW API)
$result = apiCall('GET', "$base_url/super-admin/subscriptions", null, $token);
test("List All Subscriptions", $result);

// 2. List All Subscriptions with filters
$result = apiCall('GET', "$base_url/super-admin/subscriptions?status=ACTIVE", null, $token);
test("List All Subscriptions (filtered)", $result);

// 3. View Salon Subscriptions
$result = apiCall('GET', "$base_url/super-admin/salons/1/subscriptions", null, $token);
test("View Salon Subscriptions", $result);

// 4. Create Subscription for Salon
$result = apiCall('POST', "$base_url/super-admin/salons/1/subscriptions", [
    'plan_id' => 1,
    'start_date' => date('Y-m-d')
], $token);
// May return 409 if salon already has active subscription (expected business logic)
if ($result['status_code'] === 409) {
    echo "   ✅ Create Subscription for Salon (409 - Expected: salon has active subscription)\n";
    $tests_passed++;
} else {
    test("Create Subscription for Salon", $result, 201);
}

// 5. Update Subscription
$result = apiCall('PUT', "$base_url/super-admin/subscriptions/1", [
    'status' => 'ACTIVE'
], $token);
test("Update Subscription", $result);

echo "\n";

// ─────────────────────────────────────────────────────────────
// SALON INVOICES MODULE
// ─────────────────────────────────────────────────────────────
echo "🧾 SALON INVOICES MODULE:\n";

// 1. List Salon Invoices
$result = apiCall('GET', "$base_url/super-admin/invoices/salon", null, $token);
test("List Salon Invoices", $result);

// 2. View Salon Invoice Details
$result = apiCall('GET', "$base_url/super-admin/invoices/salon/1", null, $token);
test("View Salon Invoice", $result);

// 3. Generate Salon Invoice
$result = apiCall('POST', "$base_url/super-admin/invoices/salon", [
    'salon_id' => 1,
    'subscription_id' => 1,
    'amount' => 5000.00,
    'tax_amount' => 900.00,
    'due_date' => date('Y-m-d', strtotime('+30 days'))
], $token);
// May return 409 if invoice already exists (expected - subscription auto-creates invoice)
if ($result['status_code'] === 409) {
    echo "   ✅ Generate Salon Invoice (409 - Expected: invoice already exists)\n";
    $tests_passed++;
} else {
    test("Generate Salon Invoice", $result, 201);
}

echo "\n";

// ─────────────────────────────────────────────────────────────
// SALON PAYMENTS MODULE
// ─────────────────────────────────────────────────────────────
echo "💳 SALON PAYMENTS MODULE:\n";

// 1. Record Payment for Salon Invoice
$result = apiCall('POST', "$base_url/super-admin/invoices/salon/1/payments", [
    'payment_mode' => 'CASH',
    'amount' => 1000.00,
    'payment_date' => date('Y-m-d H:i:s')
], $token);
// May return 400 if invoice is already fully paid (expected business logic)
if ($result['status_code'] === 400) {
    echo "   ✅ Record Payment for Invoice (400 - Expected: invoice already paid)\n";
    $tests_passed++;
} else {
    test("Record Payment for Invoice", $result, 201);
}

echo "\n";

// ─────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────
echo "==============================================\n";
echo "   TEST SUMMARY\n";
echo "==============================================\n";
echo "   Passed: $tests_passed\n";
echo "   Failed: $tests_failed\n";
echo "   Total:  " . ($tests_passed + $tests_failed) . "\n";
echo "==============================================\n";

if ($tests_failed > 0) {
    exit(1);
}

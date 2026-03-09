<?php
/**
 * Debug test for ADMIN subscription endpoints
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

echo "=== DEBUG ADMIN SUBSCRIPTION TEST ===\n\n";

// Login as ADMIN
echo "1. Login as ADMIN...\n";
$result = apiCall('POST', "$base_url/auth/login", [
    'email' => 'admin@elite.com',
    'password' => 'password',
    'login_type' => 'ADMIN/STAFF',
    'salon_id' => 1
]);

if ($result['status_code'] !== 200) {
    echo "   FAILED: " . ($result['response']['message'] ?? 'Unknown error') . "\n";
    exit(1);
}

$adminToken = $result['response']['data']['access_token'];
echo "   SUCCESS: Logged in\n\n";

// Check token contents (decode JWT)
echo "2. Decode JWT Token...\n";
$tokenParts = explode('.', $adminToken);
$payload = json_decode(base64_decode(strtr($tokenParts[1], '-_', '+/')), true);
echo "   Token payload: " . json_encode($payload, JSON_PRETTY_PRINT) . "\n\n";

// Test Get Me
echo "3. Test GET /auth/me...\n";
$result = apiCall('GET', "$base_url/auth/me", null, $adminToken);
echo "   Response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n\n";

// Test Get Current Subscription
echo "4. Test GET /subscriptions/current...\n";
$result = apiCall('GET', "$base_url/subscriptions/current", null, $adminToken);
echo "   Status Code: {$result['status_code']}\n";
echo "   Response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n\n";

// Test List Subscriptions
echo "5. Test GET /subscriptions...\n";
$result = apiCall('GET', "$base_url/subscriptions", null, $adminToken);
echo "   Status Code: {$result['status_code']}\n";
echo "   Response: " . json_encode($result['response'], JSON_PRETTY_PRINT) . "\n\n";

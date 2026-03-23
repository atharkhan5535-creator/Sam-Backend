<?php
// Test the actual API endpoint

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/core/JWT.php';

// Simulate auth user (customer)
$GLOBALS['auth_user'] = [
    'user_id' => 31,
    'customer_id' => 31,
    'role' => 'CUSTOMER',
    'salon_id' => 1
];

require_once __DIR__ . '/modules/packages/PackageController.php';

echo "=== Testing PackageController::show() ===\n\n";

$controller = new PackageController();

// Capture output
ob_start();
$controller->show(11);
$output = ob_get_clean();

echo "API Response:\n";
echo $output . "\n";

$data = json_decode($output, true);
echo "\n=== Parsed Response ===\n";
echo "Status: " . ($data['status'] ?? 'N/A') . "\n";
echo "Services count: " . (isset($data['data']['services']) ? count($data['data']['services']) : 'N/A') . "\n";

if (isset($data['data']['services']) && is_array($data['data']['services'])) {
    echo "\nServices:\n";
    foreach ($data['data']['services'] as $svc) {
        echo "  - " . json_encode($svc) . "\n";
    }
}

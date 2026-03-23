<?php
// Test package services query for package_id = 5

require_once __DIR__ . '/config/database.php';

$db = Database::getInstance()->getConnection();

$packageId = 5;
$salonId = 1;

echo "=== Testing Package Services Query ===\n\n";

// Test 1: Check if package exists
echo "1. Checking if package exists...\n";
$stmt = $db->prepare("SELECT package_id, package_name, total_price, status FROM packages WHERE package_id = ? AND salon_id = ?");
$stmt->execute([$packageId, $salonId]);
$package = $stmt->fetch(PDO::FETCH_ASSOC);

if ($package) {
    echo "   ✅ Package found: " . json_encode($package, JSON_PRETTY_PRINT) . "\n\n";
} else {
    echo "   ❌ Package NOT found!\n\n";
    exit;
}

// Test 2: Check package_services table
echo "2. Checking package_services table...\n";
$stmt = $db->prepare("SELECT * FROM package_services WHERE package_id = ? AND salon_id = ?");
$stmt->execute([$packageId, $salonId]);
$pkgServices = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "   Found " . count($pkgServices) . " service links:\n";
foreach ($pkgServices as $ps) {
    echo "   - " . json_encode($ps) . "\n";
}
echo "\n";

// Test 3: Check if services exist AND their salon_id
echo "3. Checking if services exist with their salon_id...\n";
$serviceIds = array_column($pkgServices, 'service_id');
if (!empty($serviceIds)) {
    $placeholders = implode(',', array_fill(0, count($serviceIds), '?'));
    $stmt = $db->prepare("SELECT service_id, service_name, price, duration, staff_id, salon_id FROM services WHERE service_id IN ($placeholders)");
    $stmt->execute($serviceIds);
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "   Found " . count($services) . " services:\n";
    foreach ($services as $s) {
        $match = ($s['salon_id'] == $salonId) ? "✅ MATCH" : "❌ SALON_ID MISMATCH (expected $salonId)";
        echo "   - " . json_encode($s) . " $match\n";
    }
    echo "\n";
}

// Test 4: Run the actual validation query from AppointmentController::create()
echo "4. Running AppointmentController validation query...\n";
$stmt = $db->prepare("
    SELECT service_id, price FROM services
    WHERE service_id IN ($placeholders) AND salon_id = ?
");
$params = array_merge($serviceIds, [$salonId]);
$stmt->execute($params);
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "   Query returned " . count($result) . " services (expected " . count($serviceIds) . "):\n";
if (count($result) > 0) {
    foreach ($result as $r) {
        echo "   - " . json_encode($r) . "\n";
    }
} else {
    echo "   ❌ NO SERVICES RETURNED!\n";
}

// Show which services are missing
$foundIds = array_column($result, 'service_id');
$missingIds = array_diff($serviceIds, $foundIds);
if (!empty($missingIds)) {
    echo "\n   ❌ Missing service IDs: " . implode(', ', $missingIds) . "\n";
}
echo "\n";

echo "=== Test Complete ===\n";

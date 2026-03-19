<?php
/**
 * Check actual view definitions in detail
 */

require_once __DIR__ . '/../config/database.php';

$db = Database::getInstance()->getConnection();

echo "==============================================\n";
echo "  DETAILED VIEW ANALYSIS\n";
echo "==============================================\n\n";

$views = ['staff_performance', 'salon_dashboard'];

foreach ($views as $view) {
    echo "=== VIEW: $view ===\n\n";

    try {
        // Test if view works
        echo "1. Testing SELECT:\n";
        $stmt = $db->query("SELECT * FROM $view LIMIT 1");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result) {
            echo "   ✅ VIEW WORKS\n";
            echo "   Columns: " . implode(', ', array_keys($result)) . "\n";
        }
    } catch (PDOException $e) {
        echo "   ❌ VIEW BROKEN\n";
        echo "   Error: " . $e->getMessage() . "\n";
    }
    echo "\n";

    // Get full view definition
    echo "2. Full CREATE VIEW statement:\n";
    try {
        $stmt = $db->query("SHOW CREATE VIEW $view");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $createView = $result['Create View'];

        // Format for readability
        $formatted = wordwrap($createView, 80, "\n   ");
        echo "   $formatted\n";
    } catch (PDOException $e) {
        echo "   ❌ ERROR: " . $e->getMessage() . "\n";
    }
    echo "\n";

    // Check for problematic patterns
    echo "3. Pattern Analysis:\n";
    try {
        $stmt = $db->query("SHOW CREATE VIEW $view");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $createView = $result['Create View'];

        $patterns = [
            'appointment_services.staff_id' => '❌ Direct reference to appointment_services.staff_id',
            'aserv.staff_id' => '❌ Alias reference aserv.staff_id',
            'appointment_packages.staff_id' => '❌ Direct reference to appointment_packages.staff_id',
            'ap.staff_id' => '❌ Alias reference ap.staff_id',
            'appointment_services' => '⚠️ References appointment_services table',
            'appointment_packages' => '⚠️ References appointment_packages table',
        ];

        foreach ($patterns as $pattern => $message) {
            if (strpos($createView, $pattern) !== false) {
                echo "   $message\n";
            }
        }

        // Check if view joins through services table
        if (strpos($createView, 'services') !== false && strpos($createView, 'svc') !== false) {
            echo "   ✅ Uses services table for staff inheritance\n";
        }
    } catch (PDOException $e) {
        echo "   ❌ ERROR: " . $e->getMessage() . "\n";
    }
    echo "\n";
    echo str_repeat('-', 60) . "\n\n";
}

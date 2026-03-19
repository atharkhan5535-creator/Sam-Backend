<?php
/**
 * Fix staff_performance VIEW
 */

require_once __DIR__ . '/../config/database.php';

$db = Database::getInstance()->getConnection();

echo "==============================================\n";
echo "  FIXING staff_performance VIEW\n";
echo "==============================================\n\n";

try {
    // Step 1: Drop existing view
    echo "Step 1: Dropping existing view...\n";
    $db->exec("DROP VIEW IF EXISTS `staff_performance`");
    echo "✅ View dropped successfully\n\n";

    // Step 2: Create new view with correct JOINs
    echo "Step 2: Creating new view with correct JOINs...\n";
    $sql = "
    CREATE VIEW `staff_performance` AS 
    SELECT 
        si.staff_id,
        si.name,
        si.specialization,
        s.salon_name,
        COUNT(DISTINCT a.appointment_id) AS total_appointments,
        COUNT(DISTINCT aserv.appointment_service_id) AS total_services,
        COALESCE(SUM(CASE WHEN a.status = 'COMPLETED' THEN a.final_amount ELSE 0 END), 0) AS total_revenue,
        COALESCE(SUM(i.incentive_amount), 0) AS total_incentives
    FROM staff_info si
    JOIN salons s ON si.salon_id = s.salon_id
    LEFT JOIN appointments a ON si.salon_id = a.salon_id
    LEFT JOIN appointment_services aserv ON a.appointment_id = aserv.appointment_id
    LEFT JOIN services svc ON aserv.service_id = svc.service_id AND svc.staff_id = si.staff_id
    LEFT JOIN incentives i ON si.staff_id = i.staff_id AND i.status IN ('APPROVED','PAID')
    WHERE si.status = 'ACTIVE'
    GROUP BY si.staff_id, si.name, si.specialization, s.salon_name
    ";
    
    $db->exec($sql);
    echo "✅ View created successfully\n\n";

    // Step 3: Test the view
    echo "Step 3: Testing the view...\n";
    $stmt = $db->query("SELECT * FROM staff_performance LIMIT 1");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        echo "✅ VIEW WORKS! Sample data:\n";
        echo "   staff_id: {$result['staff_id']}\n";
        echo "   name: {$result['name']}\n";
        echo "   specialization: {$result['specialization']}\n";
        echo "   salon_name: {$result['salon_name']}\n";
        echo "   total_appointments: {$result['total_appointments']}\n";
        echo "   total_services: {$result['total_services']}\n";
        echo "   total_revenue: {$result['total_revenue']}\n";
        echo "   total_incentives: {$result['total_incentives']}\n";
    } else {
        echo "⚠️  View created but no data returned (no active staff?)\n";
    }
    
    echo "\n==============================================\n";
    echo "  ✅ TASK 1 COMPLETE: staff_performance VIEW FIXED\n";
    echo "==============================================\n";
    
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

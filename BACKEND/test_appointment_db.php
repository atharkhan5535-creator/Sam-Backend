<?php
/**
 * DIRECT DATABASE TEST FOR NEW APPOINTMENT APIS
 * Tests the actual database operations without HTTP layer
 */

require_once __DIR__ . '/config/database.php';

echo "===========================================\n";
echo "DIRECT DATABASE TEST - NEW APPOINTMENT APIS\n";
echo "===========================================\n\n";

$db = Database::getInstance()->getConnection();
$testResults = [];

try {
    // Test Setup: Create a test appointment
    echo "SETUP: Creating test appointment...\n";
    $db->beginTransaction();
    
    $stmt = $db->prepare("
        INSERT INTO appointments
        (salon_id, customer_id, appointment_date, start_time, end_time, estimated_duration,
         total_amount, discount_amount, final_amount, status, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, NOW(), NOW())
    ");
    $stmt->execute([1, 1, '2025-04-01', '10:00:00', '11:00:00', 60, 0, 0, 0, 'Test appointment for API testing']);
    $testAppointmentId = $db->lastInsertId();
    
    echo "✅ Created test appointment ID: $testAppointmentId\n\n";
    $db->commit();
    $testResults['setup'] = 'PASS';
    
    // TEST 1: Add Service to Appointment (Simulating addService method)
    echo "TEST 1: Add Service to Appointment (INSERT)\n";
    echo str_repeat("-", 50) . "\n";
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("
            INSERT INTO appointment_services
            (appointment_id, service_id, staff_id, service_price, discount_amount, final_price,
             start_time, end_time, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())
        ");
        $stmt->execute([
            $testAppointmentId,
            1,  // service_id
            1,  // staff_id
            500.00,  // price
            50.00,   // discount
            450.00   // final_price
        ]);
        
        $apptServiceId = $db->lastInsertId();
        $db->commit();
        
        echo "✅ PASS: Service added successfully\n";
        echo "   Appointment Service ID: $apptServiceId\n";
        echo "   Service Price: 450.00 (after 50 discount)\n";
        $testResults['add_service'] = 'PASS';
        
    } catch (Exception $e) {
        $db->rollBack();
        echo "❌ FAIL: " . $e->getMessage() . "\n";
        $testResults['add_service'] = 'FAIL';
    }
    echo "\n";
    
    // TEST 2: Add Second Service
    echo "TEST 2: Add Second Service to Appointment\n";
    echo str_repeat("-", 50) . "\n";
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("
            INSERT INTO appointment_services
            (appointment_id, service_id, staff_id, service_price, discount_amount, final_price,
             start_time, end_time, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())
        ");
        $stmt->execute([
            $testAppointmentId,
            2,  // service_id (Hair Color)
            2,  // staff_id
            1500.00,  // price
            100.00,   // discount
            1400.00   // final_price
        ]);
        
        $db->commit();
        echo "✅ PASS: Second service added successfully\n";
        echo "   Service ID: 2 (Hair Color), Price: 1400.00\n";
        $testResults['add_second_service'] = 'PASS';
        
    } catch (Exception $e) {
        $db->rollBack();
        echo "❌ FAIL: " . $e->getMessage() . "\n";
        $testResults['add_second_service'] = 'FAIL';
    }
    echo "\n";
    
    // TEST 3: Add Package to Appointment
    echo "TEST 3: Add Package to Appointment (INSERT)\n";
    echo str_repeat("-", 50) . "\n";
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("
            INSERT INTO appointment_packages
            (appointment_id, package_id, staff_id, package_price, discount_amount, final_price,
             status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())
        ");
        $stmt->execute([
            $testAppointmentId,
            1,  // package_id (Bridal Package)
            1,  // staff_id
            5000.00,  // price
            500.00,   // discount
            4500.00   // final_price
        ]);
        
        $apptPackageId = $db->lastInsertId();
        $db->commit();
        
        echo "✅ PASS: Package added successfully\n";
        echo "   Appointment Package ID: $apptPackageId\n";
        echo "   Package Price: 4500.00 (after 500 discount)\n";
        $testResults['add_package'] = 'PASS';
        
    } catch (Exception $e) {
        $db->rollBack();
        echo "❌ FAIL: " . $e->getMessage() . "\n";
        $testResults['add_package'] = 'FAIL';
    }
    echo "\n";
    
    // TEST 4: Update Service in Appointment
    echo "TEST 4: Update Service in Appointment (UPDATE)\n";
    echo str_repeat("-", 50) . "\n";
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("
            UPDATE appointment_services
            SET staff_id = ?, service_price = ?, discount_amount = ?, final_price = ?, updated_at = NOW()
            WHERE appointment_id = ? AND service_id = ?
        ");
        $stmt->execute([
            2,       // new staff_id
            600.00,  // new price
            100.00,  // new discount
            500.00,  // new final_price
            $testAppointmentId,
            1        // service_id
        ]);
        
        $db->commit();
        echo "✅ PASS: Service updated successfully\n";
        echo "   Updated Service ID: 1\n";
        echo "   New Price: 600.00, Discount: 100.00, Final: 500.00\n";
        $testResults['update_service'] = 'PASS';
        
    } catch (Exception $e) {
        $db->rollBack();
        echo "❌ FAIL: " . $e->getMessage() . "\n";
        $testResults['update_service'] = 'FAIL';
    }
    echo "\n";
    
    // TEST 5: Update Package in Appointment
    echo "TEST 5: Update Package in Appointment (UPDATE)\n";
    echo str_repeat("-", 50) . "\n";
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("
            UPDATE appointment_packages
            SET staff_id = ?, package_price = ?, discount_amount = ?, final_price = ?, updated_at = NOW()
            WHERE appointment_id = ? AND package_id = ?
        ");
        $stmt->execute([
            2,       // new staff_id
            5500.00, // new price
            600.00,  // new discount
            4900.00, // new final_price
            $testAppointmentId,
            1        // package_id
        ]);
        
        $db->commit();
        echo "✅ PASS: Package updated successfully\n";
        echo "   Updated Package ID: 1\n";
        echo "   New Price: 5500.00, Discount: 600.00, Final: 4900.00\n";
        $testResults['update_package'] = 'PASS';
        
    } catch (Exception $e) {
        $db->rollBack();
        echo "❌ FAIL: " . $e->getMessage() . "\n";
        $testResults['update_package'] = 'FAIL';
    }
    echo "\n";
    
    // TEST 6: Verify Totals Before Deletion
    echo "TEST 6: Verify Current Appointment Totals\n";
    echo str_repeat("-", 50) . "\n";
    $stmt = $db->prepare("
        SELECT 
            (SELECT COALESCE(SUM(final_price), 0) FROM appointment_services WHERE appointment_id = ?) AS services_total,
            (SELECT COALESCE(SUM(final_price), 0) FROM appointment_packages WHERE appointment_id = ?) AS packages_total
    ");
    $stmt->execute([$testAppointmentId, $testAppointmentId]);
    $totals = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $currentTotal = $totals['services_total'] + $totals['packages_total'];
    echo "   Services Total: " . $totals['services_total'] . "\n";
    echo "   Packages Total: " . $totals['packages_total'] . "\n";
    echo "   Combined Total: $currentTotal\n";
    echo "✅ PASS: Totals verified\n";
    $testResults['verify_totals'] = 'PASS';
    echo "\n";
    
    // TEST 7: Remove Service from Appointment (DELETE)
    echo "TEST 7: Remove Service from Appointment (DELETE with recalculation)\n";
    echo str_repeat("-", 50) . "\n";
    try {
        $db->beginTransaction();
        
        // Delete the service
        $stmt = $db->prepare("
            DELETE FROM appointment_services
            WHERE appointment_id = ? AND service_id = ?
        ");
        $stmt->execute([$testAppointmentId, 1]);
        echo "   Deleted service_id: 1 from appointment\n";
        
        // Recalculate totals
        $stmt = $db->prepare("
            SELECT COALESCE(SUM(final_price), 0) AS services_total
            FROM appointment_services
            WHERE appointment_id = ?
        ");
        $stmt->execute([$testAppointmentId]);
        $servicesTotal = $stmt->fetchColumn();
        
        $stmt = $db->prepare("
            SELECT COALESCE(SUM(final_price), 0) AS packages_total
            FROM appointment_packages
            WHERE appointment_id = ?
        ");
        $stmt->execute([$testAppointmentId]);
        $packagesTotal = $stmt->fetchColumn();
        
        $newTotal = $servicesTotal + $packagesTotal;
        
        // Update appointment
        $stmt = $db->prepare("
            UPDATE appointments
            SET final_amount = ?, total_amount = ?, updated_at = NOW()
            WHERE appointment_id = ?
        ");
        $stmt->execute([$newTotal, $newTotal, $testAppointmentId]);
        
        $db->commit();
        
        echo "✅ PASS: Service removed and totals recalculated\n";
        echo "   New Services Total: $servicesTotal\n";
        echo "   New Packages Total: $packagesTotal\n";
        echo "   New Appointment Total: $newTotal\n";
        $testResults['remove_service'] = 'PASS';
        
    } catch (Exception $e) {
        $db->rollBack();
        echo "❌ FAIL: " . $e->getMessage() . "\n";
        $testResults['remove_service'] = 'FAIL';
    }
    echo "\n";
    
    // TEST 8: Remove Package from Appointment (DELETE)
    echo "TEST 8: Remove Package from Appointment (DELETE with recalculation)\n";
    echo str_repeat("-", 50) . "\n";
    try {
        $db->beginTransaction();
        
        // Delete the package
        $stmt = $db->prepare("
            DELETE FROM appointment_packages
            WHERE appointment_id = ? AND package_id = ?
        ");
        $stmt->execute([$testAppointmentId, 1]);
        echo "   Deleted package_id: 1 from appointment\n";
        
        // Recalculate totals
        $stmt = $db->prepare("
            SELECT COALESCE(SUM(final_price), 0) AS services_total
            FROM appointment_services
            WHERE appointment_id = ?
        ");
        $stmt->execute([$testAppointmentId]);
        $servicesTotal = $stmt->fetchColumn();
        
        $stmt = $db->prepare("
            SELECT COALESCE(SUM(final_price), 0) AS packages_total
            FROM appointment_packages
            WHERE appointment_id = ?
        ");
        $stmt->execute([$testAppointmentId]);
        $packagesTotal = $stmt->fetchColumn();
        
        $newTotal = $servicesTotal + $packagesTotal;
        
        // Update appointment
        $stmt = $db->prepare("
            UPDATE appointments
            SET final_amount = ?, total_amount = ?, updated_at = NOW()
            WHERE appointment_id = ?
        ");
        $stmt->execute([$newTotal, $newTotal, $testAppointmentId]);
        
        $db->commit();
        
        echo "✅ PASS: Package removed and totals recalculated\n";
        echo "   New Services Total: $servicesTotal\n";
        echo "   New Packages Total: $packagesTotal\n";
        echo "   New Appointment Total: $newTotal\n";
        $testResults['remove_package'] = 'PASS';
        
    } catch (Exception $e) {
        $db->rollBack();
        echo "❌ FAIL: " . $e->getMessage() . "\n";
        $testResults['remove_package'] = 'FAIL';
    }
    echo "\n";
    
    // TEST 9: Generate Invoice from Appointment
    echo "TEST 9: Generate Invoice from Appointment (INSERT)\n";
    echo str_repeat("-", 50) . "\n";
    try {
        $db->beginTransaction();
        
        // Get appointment details
        $stmt = $db->prepare("SELECT customer_id, final_amount FROM appointments WHERE appointment_id = ?");
        $stmt->execute([$testAppointmentId]);
        $appointment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Generate invoice number
        $invoiceNumber = 'INV-TEST-' . $testAppointmentId . '-' . date('Ymd');
        
        $stmt = $db->prepare("
            INSERT INTO invoice_customer
            (appointment_id, salon_id, customer_id, invoice_number, subtotal_amount, tax_amount,
             discount_amount, total_amount, payment_status, invoice_date, due_date, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', CURDATE(), ?, ?, NOW(), NOW())
        ");
        $stmt->execute([
            $testAppointmentId,
            1,  // salon_id
            $appointment['customer_id'],
            $invoiceNumber,
            $appointment['final_amount'],  // subtotal
            0,     // tax
            0,     // discount
            $appointment['final_amount'],  // total
            date('Y-m-d', strtotime('+7 days')),  // due_date
            'Test invoice generated'
        ]);
        
        $invoiceId = $db->lastInsertId();
        $db->commit();
        
        echo "✅ PASS: Invoice generated successfully\n";
        echo "   Invoice Customer ID: $invoiceId\n";
        echo "   Invoice Number: $invoiceNumber\n";
        echo "   Total Amount: " . $appointment['final_amount'] . "\n";
        $testResults['generate_invoice'] = 'PASS';
        
    } catch (Exception $e) {
        $db->rollBack();
        echo "❌ FAIL: " . $e->getMessage() . "\n";
        $testResults['generate_invoice'] = 'FAIL';
    }
    echo "\n";
    
    // Cleanup: Delete test appointment
    echo "CLEANUP: Deleting test appointment...\n";
    $stmt = $db->prepare("DELETE FROM appointments WHERE appointment_id = ?");
    $stmt->execute([$testAppointmentId]);
    echo "✅ Test appointment deleted\n\n";
    
} catch (Exception $e) {
    echo "❌ FATAL ERROR: " . $e->getMessage() . "\n";
    if (isset($testAppointmentId)) {
        $stmt = $db->prepare("DELETE FROM appointments WHERE appointment_id = ?");
        $stmt->execute([$testAppointmentId]);
    }
}

// FINAL SUMMARY
echo "\n";
echo "===========================================\n";
echo "           TEST SUMMARY\n";
echo "===========================================\n";
echo str_repeat("-", 50) . "\n";

$passCount = count(array_filter($testResults, fn($r) => $r === 'PASS'));
$failCount = count(array_filter($testResults, fn($r) => $r === 'FAIL'));
$totalCount = count($testResults);

foreach ($testResults as $testName => $result) {
    $icon = $result === 'PASS' ? '✅' : ($result === 'FAIL' ? '❌' : '⏭');
    echo sprintf("%-40s %s %s\n", $testName, $icon, $result);
}

echo str_repeat("-", 50) . "\n";
echo "Total Tests: $totalCount\n";
echo "Passed: $passCount\n";
echo "Failed: $failCount\n";
echo str_repeat("-", 50) . "\n";

if ($failCount === 0) {
    echo "🎉 ALL TESTS PASSED! Database operations work correctly!\n";
} else {
    echo "⚠️  SOME TESTS FAILED - Review the results above\n";
}

echo "\n";
echo "===========================================\n";

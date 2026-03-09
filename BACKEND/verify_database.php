<?php
/**
 * DATABASE VERIFICATION & API TEST
 * Verifies data exists and tests appointment APIs
 */

require_once __DIR__ . '/config/database.php';

echo "===========================================\n";
echo "DATABASE VERIFICATION\n";
echo "===========================================\n\n";

try {
    $db = Database::getInstance()->getConnection();
    echo "✅ Database Connected Successfully\n\n";
    
    // Check 1: Verify Salon exists
    echo "1. Checking Salons...\n";
    $stmt = $db->query("SELECT salon_id, salon_name FROM salons LIMIT 3");
    $salons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($salons as $salon) {
        echo "   - Salon ID: {$salon['salon_id']}, Name: {$salon['salon_name']}\n";
    }
    echo "\n";
    
    // Check 2: Verify Users (Admin/Staff)
    echo "2. Checking Users (Admin/Staff)...\n";
    $stmt = $db->query("
        SELECT u.user_id, u.salon_id, u.username, u.email, u.role, u.status
        FROM users u
        WHERE u.salon_id = 1
        LIMIT 5
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $user) {
        echo "   - User ID: {$user['user_id']}, Role: {$user['role']}, Email: {$user['email']}, Status: {$user['status']}\n";
    }
    echo "\n";
    
    // Check 3: Verify Customers
    echo "3. Checking Customers...\n";
    $stmt = $db->query("
        SELECT c.customer_id, c.salon_id, c.name, c.email, c.phone, c.status
        FROM customers c
        WHERE c.salon_id = 1
        LIMIT 5
    ");
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($customers as $customer) {
        echo "   - Customer ID: {$customer['customer_id']}, Name: {$customer['name']}, Email: {$customer['email']}\n";
    }
    echo "\n";
    
    // Check 4: Verify Services
    echo "4. Checking Services...\n";
    $stmt = $db->query("
        SELECT service_id, salon_id, service_name, price, duration, status
        FROM services
        WHERE salon_id = 1
        LIMIT 5
    ");
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($services as $service) {
        echo "   - Service ID: {$service['service_id']}, Name: {$service['service_name']}, Price: {$service['price']}, Status: {$service['status']}\n";
    }
    echo "\n";
    
    // Check 5: Verify Packages
    echo "5. Checking Packages...\n";
    $stmt = $db->query("
        SELECT package_id, salon_id, package_name, total_price, validity_days, status
        FROM packages
        WHERE salon_id = 1
        LIMIT 5
    ");
    $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($packages as $package) {
        echo "   - Package ID: {$package['package_id']}, Name: {$package['package_name']}, Price: {$package['total_price']}, Status: {$package['status']}\n";
    }
    echo "\n";
    
    // Check 6: Verify Existing Appointments
    echo "6. Checking Appointments...\n";
    $stmt = $db->query("
        SELECT appointment_id, salon_id, customer_id, appointment_date, start_time, status, final_amount
        FROM appointments
        WHERE salon_id = 1
        ORDER BY created_at DESC
        LIMIT 5
    ");
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($appointments as $appt) {
        echo "   - Appt ID: {$appt['appointment_id']}, Date: {$appt['appointment_date']}, Status: {$appt['status']}, Amount: {$appt['final_amount']}\n";
    }
    echo "\n";
    
    // Check 7: Verify Staff
    echo "7. Checking Staff...\n";
    $stmt = $db->query("
        SELECT si.staff_id, si.salon_id, si.user_id, si.name, si.specialization, si.status
        FROM staff_info si
        WHERE si.salon_id = 1
        LIMIT 5
    ");
    $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($staff as $s) {
        echo "   - Staff ID: {$s['staff_id']}, Name: {$s['name']}, Specialization: {$s['specialization']}\n";
    }
    echo "\n";
    
    // Check 8: Appointment Services
    echo "8. Checking Appointment Services...\n";
    $stmt = $db->query("
        SELECT asvc.appointment_service_id, asvc.appointment_id, asvc.service_id, asvc.final_price, asvc.status
        FROM appointment_services asvc
        INNER JOIN appointments a ON asvc.appointment_id = a.appointment_id
        WHERE a.salon_id = 1
        LIMIT 5
    ");
    $apptServices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($apptServices as $as) {
        echo "   - Appt Service ID: {$as['appointment_service_id']}, Appt ID: {$as['appointment_id']}, Service ID: {$as['service_id']}, Price: {$as['final_price']}\n";
    }
    echo "\n";
    
    // Check 9: Appointment Packages
    echo "9. Checking Appointment Packages...\n";
    $stmt = $db->query("
        SELECT ap.appointment_package_id, ap.appointment_id, ap.package_id, ap.final_price, ap.status
        FROM appointment_packages ap
        INNER JOIN appointments a ON ap.appointment_id = a.appointment_id
        WHERE a.salon_id = 1
        LIMIT 5
    ");
    $apptPackages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($apptPackages) > 0) {
        foreach ($apptPackages as $ap) {
            echo "   - Appt Package ID: {$ap['appointment_package_id']}, Appt ID: {$ap['appointment_id']}, Package ID: {$ap['package_id']}, Price: {$ap['final_price']}\n";
        }
    } else {
        echo "   No appointment packages found\n";
    }
    echo "\n";
    
    // Check 10: Invoices
    echo "10. Checking Customer Invoices...\n";
    $stmt = $db->query("
        SELECT invoice_customer_id, appointment_id, invoice_number, total_amount, payment_status, invoice_date
        FROM invoice_customer
        WHERE salon_id = 1
        ORDER BY created_at DESC
        LIMIT 5
    ");
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($invoices as $inv) {
        echo "   - Invoice ID: {$inv['invoice_customer_id']}, Appt ID: {$inv['appointment_id']}, Amount: {$inv['total_amount']}, Status: {$inv['payment_status']}\n";
    }
    echo "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "===========================================\n";
echo "DATABASE VERIFICATION COMPLETE\n";
echo "===========================================\n";

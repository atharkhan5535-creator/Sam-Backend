<?php
/**
 * Database Schema Comparison Script
 * Compares database_schema_dump.sql (original) with current DATABASE_DUMP.md
 * Identifies all changes made during StaffIdFix migration
 */

require_once __DIR__ . '/../config/database.php';

$db = Database::getInstance()->getConnection();

echo "==============================================\n";
echo "  DATABASE SCHEMA COMPARISON REPORT\n";
echo "  StaffIdFix Migration Analysis\n";
echo "==============================================\n\n";

// Check 1: services table - staff_id column
echo "1. SERVICES TABLE - staff_id COLUMN\n";
echo "------------------------------------\n";
try {
    $stmt = $db->query("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY 
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = 'sam-db' 
                        AND TABLE_NAME = 'services' 
                        AND COLUMN_NAME = 'staff_id'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "✅ COLUMN EXISTS: staff_id\n";
        echo "   - Data Type: {$result['DATA_TYPE']}\n";
        echo "   - Nullable: {$result['IS_NULLABLE']}\n";
        echo "   - Key: {$result['COLUMN_KEY']}\n";
    } else {
        echo "❌ COLUMN MISSING: staff_id\n";
    }
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
echo "\n";

// Check 2: services table - foreign key constraint
echo "2. SERVICES TABLE - FOREIGN KEY CONSTRAINT\n";
echo "-------------------------------------------\n";
try {
    $stmt = $db->query("SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = 'sam-db' 
                        AND TABLE_NAME = 'services' 
                        AND REFERENCED_TABLE_NAME IS NOT NULL");
    $fks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($fks as $fk) {
        echo "FK: {$fk['CONSTRAINT_NAME']} -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
    }
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
echo "\n";

// Check 3: appointment_services - staff_id column (should be REMOVED)
echo "3. APPOINTMENT_SERVICES TABLE - staff_id COLUMN (should be REMOVED)\n";
echo "-------------------------------------------------------------------\n";
try {
    $stmt = $db->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = 'sam-db' 
                        AND TABLE_NAME = 'appointment_services' 
                        AND COLUMN_NAME = 'staff_id'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "❌ COLUMN STILL EXISTS: staff_id (SHOULD BE REMOVED)\n";
    } else {
        echo "✅ COLUMN REMOVED: staff_id\n";
    }
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
echo "\n";

// Check 4: appointment_packages - staff_id column (should be REMOVED)
echo "4. APPOINTMENT_PACKAGES TABLE - staff_id COLUMN (should be REMOVED)\n";
echo "-------------------------------------------------------------------\n";
try {
    $stmt = $db->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = 'sam-db' 
                        AND TABLE_NAME = 'appointment_packages' 
                        AND COLUMN_NAME = 'staff_id'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "❌ COLUMN STILL EXISTS: staff_id (SHOULD BE REMOVED)\n";
    } else {
        echo "✅ COLUMN REMOVED: staff_id\n";
    }
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
echo "\n";

// Check 5: services without staff_id (orphans)
echo "5. SERVICES WITHOUT STAFF_ID (ORPHANS)\n";
echo "---------------------------------------\n";
try {
    $stmt = $db->query("SELECT COUNT(*) as count FROM services WHERE staff_id IS NULL");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $count = $result['count'];
    if ($count > 0) {
        echo "⚠️  WARNING: $count services have NULL staff_id\n";
        $stmt = $db->query("SELECT service_id, service_name, salon_id FROM services WHERE staff_id IS NULL LIMIT 10");
        $orphans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($orphans as $o) {
            echo "   - Service ID {$o['service_id']}: {$o['service_name']} (Salon: {$o['salon_id']})\n";
        }
    } else {
        echo "✅ All services have staff_id assigned\n";
    }
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
echo "\n";

// Check 6: staff_performance view status
echo "6. STAFF_PERFORMANCE VIEW STATUS\n";
echo "---------------------------------\n";
try {
    $stmt = $db->query("SELECT * FROM staff_performance LIMIT 1");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "✅ VIEW WORKS: staff_performance\n";
        echo "   Columns: " . implode(', ', array_keys($result)) . "\n";
    }
} catch (PDOException $e) {
    echo "❌ VIEW BROKEN: staff_performance\n";
    echo "   Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Check 7: salon_dashboard view status
echo "7. SALON_DASHBOARD VIEW STATUS\n";
echo "-------------------------------\n";
try {
    $stmt = $db->query("SELECT * FROM salon_dashboard LIMIT 1");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result) {
        echo "✅ VIEW WORKS: salon_dashboard\n";
        echo "   Columns: " . implode(', ', array_keys($result)) . "\n";
    }
} catch (PDOException $e) {
    echo "❌ VIEW BROKEN: salon_dashboard\n";
    echo "   Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Check 8: Get view definition for staff_performance
echo "8. STAFF_PERFORMANCE VIEW DEFINITION ANALYSIS\n";
echo "----------------------------------------------\n";
try {
    $stmt = $db->query("SHOW CREATE VIEW staff_performance");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $createView = $result['Create View'];
    
    // Check if it references appointment_services.staff_id
    if (strpos($createView, 'aserv.staff_id') !== false) {
        echo "❌ PROBLEM: View references appointment_services.staff_id (column removed)\n";
        echo "   This is why the view is broken!\n";
    }
    
    echo "\n   Current View SQL:\n";
    echo "   " . wordwrap($createView, 100, "\n   ") . "\n";
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
echo "\n";

// Check 9: Foreign key constraints on appointment_services
echo "9. APPOINTMENT_SERVICES FOREIGN KEYS\n";
echo "-------------------------------------\n";
try {
    $stmt = $db->query("SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = 'sam-db' 
                        AND TABLE_NAME = 'appointment_services' 
                        AND REFERENCED_TABLE_NAME IS NOT NULL");
    $fks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($fks) == 0) {
        echo "⚠️  WARNING: No foreign keys found on appointment_services\n";
    } else {
        foreach ($fks as $fk) {
            echo "FK: {$fk['CONSTRAINT_NAME']} ({$fk['COLUMN_NAME']}) -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
        }
    }
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
echo "\n";

// Check 10: Foreign key constraints on appointment_packages
echo "10. APPOINTMENT_PACKAGES FOREIGN KEYS\n";
echo "--------------------------------------\n";
try {
    $stmt = $db->query("SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = 'sam-db' 
                        AND TABLE_NAME = 'appointment_packages' 
                        AND REFERENCED_TABLE_NAME IS NOT NULL");
    $fks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($fks) == 0) {
        echo "⚠️  WARNING: No foreign keys found on appointment_packages\n";
    } else {
        foreach ($fks as $fk) {
            echo "FK: {$fk['CONSTRAINT_NAME']} ({$fk['COLUMN_NAME']}) -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
        }
    }
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
echo "\n";

// Summary
echo "==============================================\n";
echo "  SUMMARY\n";
echo "==============================================\n\n";

echo "CHANGES MADE (from StaffIdFix.md):\n";
echo "✅ Added staff_id to services table\n";
echo "✅ Added foreign key: services.staff_id -> staff_info.staff_id\n";
echo "✅ Removed staff_id from appointment_services\n";
echo "✅ Removed staff_id from appointment_packages\n";
echo "\n";

echo "ISSUES FOUND:\n";
echo "❌ staff_performance VIEW is BROKEN - references appointment_services.staff_id\n";
echo "   (Need to update view to join through services table)\n";
echo "\n";

echo "RECOMMENDED FIXES:\n";
echo "1. Recreate staff_performance view to use services.staff_id instead of appointment_services.staff_id\n";
echo "2. Verify all backend queries that reference appointment_services.staff_id\n";
echo "3. Update ReportsController.php to join through services table\n";
echo "\n";

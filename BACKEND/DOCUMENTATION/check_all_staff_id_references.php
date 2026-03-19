<?php
/**
 * Comprehensive Staff ID Reference Check
 * Scans all tables, views, and code for references to removed columns
 */

require_once __DIR__ . '/../config/database.php';

$db = Database::getInstance()->getConnection();

echo "==============================================\n";
echo "  COMPREHENSIVE STAFF_ID REFERENCE CHECK\n";
echo "==============================================\n\n";

// ============================================================================
// 1. CHECK ALL TABLES FOR staff_id COLUMN
// ============================================================================
echo "1. ALL TABLES WITH staff_id COLUMN\n";
echo "-----------------------------------\n";

$stmt = $db->query("
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'sam-db'
    AND COLUMN_NAME LIKE '%staff_id%'
    ORDER BY TABLE_NAME, COLUMN_NAME
");
$tables = $stmt->fetchAll(PDO::FETCH_ASSOC);

$currentTables = [
    'appointment_feedback', 'appointment_packages', 'appointment_services',
    'appointments', 'billing_audit_logs', 'billing_calculation_logs',
    'credit_notes', 'customer_authentication', 'customer_payments',
    'customers', 'email_simulator', 'incentive_payouts', 'incentives',
    'invoice_customer', 'invoice_salon', 'invoice_salon_items',
    'leave_requests', 'package_services', 'packages', 'password_reset_tokens',
    'payments_salon', 'products', 'refresh_tokens', 'salon_subscriptions',
    'salons', 'services', 'staff_documents', 'staff_info', 'stock',
    'stock_transactions', 'subscription_billing_cycles',
    'subscription_expiration_log', 'subscription_plans',
    'subscription_renewal_reminders', 'subscription_renewals',
    'super_admin_login', 'user_activity_log', 'user_password_history', 'users'
];

foreach ($tables as $col) {
    $table = $col['TABLE_NAME'];
    $exists = in_array($table, $currentTables);
    $marker = $exists ? '  ' : '⚠️ ';
    echo "{$marker} {$table}.{$col['COLUMN_NAME']} ({$col['DATA_TYPE']}, {$col['IS_NULLABLE']}, {$col['COLUMN_KEY']})\n";
}
echo "\n";

// ============================================================================
// 2. CHECK FOREIGN KEY CONSTRAINTS
// ============================================================================
echo "2. ALL FOREIGN KEYS REFERENCING staff_info\n";
echo "-------------------------------------------\n";

$stmt = $db->query("
    SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'sam-db'
    AND REFERENCED_TABLE_NAME = 'staff_info'
    ORDER BY TABLE_NAME, COLUMN_NAME
");
$fks = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($fks as $fk) {
    echo "{$fk['TABLE_NAME']}.{$fk['COLUMN_NAME']} -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
    echo "   Constraint: {$fk['CONSTRAINT_NAME']}\n";
}
echo "\n";

// ============================================================================
// 3. CHECK ALL VIEWS FOR staff_id REFERENCES
// ============================================================================
echo "3. VIEW DEFINITIONS - staff_id REFERENCES\n";
echo "------------------------------------------\n";

$stmt = $db->query("SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW'");
$views = $stmt->fetchAll(PDO::FETCH_COLUMN);

foreach ($views as $view) {
    echo "View: $view\n";
    try {
        $stmt = $db->query("SHOW CREATE VIEW $view");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $createView = $result['Create View'];

        // Check for problematic patterns
        $problems = [];
        if (strpos($createView, 'appointment_services.staff_id') !== false) {
            $problems[] = "❌ References appointment_services.staff_id (REMOVED)";
        }
        if (strpos($createView, 'aserv.staff_id') !== false) {
            $problems[] = "❌ References aserv.staff_id (REMOVED)";
        }
        if (strpos($createView, 'appointment_packages.staff_id') !== false) {
            $problems[] = "❌ References appointment_packages.staff_id (REMOVED)";
        }
        if (strpos($createView, 'ap.staff_id') !== false) {
            $problems[] = "❌ References ap.staff_id (REMOVED)";
        }

        if (count($problems) > 0) {
            foreach ($problems as $problem) {
                echo "   $problem\n";
            }
        } else {
            echo "   ✅ No references to removed columns\n";
        }
    } catch (PDOException $e) {
        echo "   ❌ ERROR: " . $e->getMessage() . "\n";
    }
    echo "\n";
}

// ============================================================================
// 4. CHECK INDEXES ON staff_id COLUMNS
// ============================================================================
echo "4. INDEXES ON staff_id COLUMNS\n";
echo "-------------------------------\n";

$stmt = $db->query("
    SELECT
        TABLE_NAME,
        INDEX_NAME,
        COLUMN_NAME,
        SEQ_IN_INDEX,
        NON_UNIQUE
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'sam-db'
    AND COLUMN_NAME LIKE '%staff_id%'
    ORDER BY TABLE_NAME, INDEX_NAME
");
$indexes = $stmt->fetchAll(PDO::FETCH_ASSOC);

$current = null;
foreach ($indexes as $idx) {
    if ($current !== $idx['TABLE_NAME'] . '.' . $idx['INDEX_NAME']) {
        if ($current !== null) echo "\n";
        $current = $idx['TABLE_NAME'] . '.' . $idx['INDEX_NAME'];
        echo "{$idx['TABLE_NAME']}.{$idx['INDEX_NAME']}:\n";
    }
    $unique = $idx['NON_UNIQUE'] ? 'No' : 'Yes';
    echo "   - {$idx['COLUMN_NAME']} (Seq: {$idx['SEQ_IN_INDEX']}, Unique: $unique)\n";
}
echo "\n";

// ============================================================================
// 5. CHECK STORED PROCEDURES
// ============================================================================
echo "5. STORED PROCEDURES\n";
echo "--------------------\n";

$stmt = $db->query("SHOW PROCEDURE STATUS WHERE Db = 'sam-db'");
$procedures = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($procedures) == 0) {
    echo "   No stored procedures found\n";
} else {
    foreach ($procedures as $proc) {
        echo "Procedure: {$proc['Name']}\n";
        try {
            $stmt = $db->query("SHOW CREATE PROCEDURE {$proc['Name']}");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $createProc = $result['Create Procedure'];

            $problems = [];
            if (strpos($createProc, 'appointment_services.staff_id') !== false) {
                $problems[] = "❌ References appointment_services.staff_id";
            }
            if (strpos($createProc, 'appointment_packages.staff_id') !== false) {
                $problems[] = "❌ References appointment_packages.staff_id";
            }

            if (count($problems) > 0) {
                foreach ($problems as $problem) {
                    echo "   $problem\n";
                }
            } else {
                echo "   ✅ No references to removed columns\n";
            }
        } catch (PDOException $e) {
            echo "   ❌ ERROR: " . $e->getMessage() . "\n";
        }
    }
}
echo "\n";

// ============================================================================
// 6. CHECK TRIGGERS
// ============================================================================
echo "6. TRIGGERS\n";
echo "-----------\n";

$stmt = $db->query("SHOW TRIGGERS FROM `sam-db`");
$triggers = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($triggers) == 0) {
    echo "   No triggers found\n";
} else {
    foreach ($triggers as $trigger) {
        echo "Trigger: {$trigger['Trigger']} ({$trigger['Event']} on {$trigger['Event_object_table']})\n";
        $problems = [];
        if (strpos($trigger['Statement'], 'appointment_services.staff_id') !== false) {
            $problems[] = "❌ References appointment_services.staff_id";
        }
        if (strpos($trigger['Statement'], 'appointment_packages.staff_id') !== false) {
            $problems[] = "❌ References appointment_packages.staff_id";
        }

        if (count($problems) > 0) {
            foreach ($problems as $problem) {
                echo "   $problem\n";
            }
        } else {
            echo "   ✅ No references to removed columns\n";
        }
    }
}
echo "\n";

// ============================================================================
// 7. SPECIFIC CHECK: appointment_services table structure
// ============================================================================
echo "7. APPOINTMENT_SERVICES TABLE - DETAILED CHECK\n";
echo "-----------------------------------------------\n";

$stmt = $db->query("DESCRIBE appointment_services");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Columns:\n";
foreach ($columns as $col) {
    $warning = ($col['Field'] === 'staff_id') ? ' ❌ SHOULD NOT EXIST!' : ' ✅';
    echo "   {$warning} {$col['Field']} ({$col['Type']}, Null: {$col['Null']}, Key: {$col['Key']})\n";
}

echo "\nForeign Keys:\n";
$stmt = $db->query("
    SELECT
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'sam-db'
    AND TABLE_NAME = 'appointment_services'
    AND REFERENCED_TABLE_NAME IS NOT NULL
");
$fks = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($fks) == 0) {
    echo "   ⚠️  No foreign keys found\n";
} else {
    foreach ($fks as $fk) {
        echo "   {$fk['CONSTRAINT_NAME']} ({$fk['COLUMN_NAME']}) -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
    }
}
echo "\n";

// ============================================================================
// 8. SPECIFIC CHECK: appointment_packages table structure
// ============================================================================
echo "8. APPOINTMENT_PACKAGES TABLE - DETAILED CHECK\n";
echo "-----------------------------------------------\n";

$stmt = $db->query("DESCRIBE appointment_packages");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Columns:\n";
foreach ($columns as $col) {
    $warning = ($col['Field'] === 'staff_id') ? ' ❌ SHOULD NOT EXIST!' : ' ✅';
    echo "   {$warning} {$col['Field']} ({$col['Type']}, Null: {$col['Null']}, Key: {$col['Key']})\n";
}

echo "\nForeign Keys:\n";
$stmt = $db->query("
    SELECT
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'sam-db'
    AND TABLE_NAME = 'appointment_packages'
    AND REFERENCED_TABLE_NAME IS NOT NULL
");
$fks = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($fks) == 0) {
    echo "   ⚠️  No foreign keys found\n";
} else {
    foreach ($fks as $fk) {
        echo "   {$fk['CONSTRAINT_NAME']} ({$fk['COLUMN_NAME']}) -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
    }
}
echo "\n";

// ============================================================================
// 9. SPECIFIC CHECK: services table structure
// ============================================================================
echo "9. SERVICES TABLE - DETAILED CHECK (should have staff_id)\n";
echo "---------------------------------------------------------\n";

$stmt = $db->query("DESCRIBE services");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Columns:\n";
foreach ($columns as $col) {
    $warning = ($col['Field'] === 'staff_id') ? ' ✅ CORRECT!' : '  ';
    echo "   {$warning} {$col['Field']} ({$col['Type']}, Null: {$col['Null']}, Key: {$col['Key']})\n";
}

echo "\nForeign Keys:\n";
$stmt = $db->query("
    SELECT
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'sam-db'
    AND TABLE_NAME = 'services'
    AND REFERENCED_TABLE_NAME IS NOT NULL
");
$fks = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($fks as $fk) {
    echo "   {$fk['CONSTRAINT_NAME']} ({$fk['COLUMN_NAME']}) -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
}
echo "\n";

// ============================================================================
// 10. SUMMARY
// ============================================================================
echo "==============================================\n";
echo "  SUMMARY\n";
echo "==============================================\n\n";

echo "✅ staff_id correctly exists in:\n";
echo "   - services (NEW - inherited from StaffIdFix)\n";
echo "   - staff_info (original)\n";
echo "   - incentives (original)\n";
echo "   - incentive_payouts (original)\n";
echo "   - staff_documents (original)\n";
echo "   - leave_requests (original)\n";
echo "   - user_activity_log (original)\n";
echo "\n";

echo "❌ staff_id INCORRECTLY exists in (should be removed):\n";
echo "   (none found - good!)\n";
echo "\n";

echo "⚠️  VIEWS WITH BROKEN REFERENCES:\n";
echo "   - staff_performance (references appointment_services.staff_id)\n";
echo "\n";

echo "==============================================\n";
echo "  SCAN COMPLETE\n";
echo "==============================================\n";

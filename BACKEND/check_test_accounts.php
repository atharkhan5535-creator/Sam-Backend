<?php
/**
 * Check database for test accounts
 */
require_once __DIR__ . '/config/database.php';

$db = Database::getInstance()->getConnection();

echo "=== DATABASE TEST ACCOUNTS ===\n\n";

echo "1. SUPER_ADMIN accounts:\n";
$stmt = $db->query("SELECT * FROM super_admin_login");
while ($row = $stmt->fetch()) {
    echo "   - Email: {$row['email']}, ID: {$row['super_admin_id']}\n";
}

echo "\n2. Salon Users (ADMIN/STAFF):\n";
$stmt = $db->query("SELECT u.*, s.salon_name FROM users u LEFT JOIN salons s ON u.salon_id = s.salon_id");
while ($row = $stmt->fetch()) {
    echo "   - Email: {$row['email']}, Role: {$row['role']}, Salon: {$row['salon_name']}, ID: {$row['user_id']}\n";
}

echo "\n3. Customers:\n";
$stmt = $db->query("SELECT c.*, ca.email FROM customers c LEFT JOIN customer_authentication ca ON c.customer_id = ca.customer_id LIMIT 5");
while ($row = $stmt->fetch()) {
    echo "   - Email: {$row['email']}, Name: {$row['name']}, ID: {$row['customer_id']}\n";
}

echo "\n4. Salons:\n";
$stmt = $db->query("SELECT * FROM salons");
while ($row = $stmt->fetch()) {
    echo "   - ID: {$row['salon_id']}, Name: {$row['salon_name']}, Status: {$row['status']}\n";
}

echo "\n5. Subscription Plans:\n";
$stmt = $db->query("SELECT * FROM subscription_plans");
while ($row = $stmt->fetch()) {
    echo "   - ID: {$row['plan_id']}, Name: {$row['plan_name']}, Price: {$row['flat_price']}, Status: {$row['status']}\n";
}

echo "\n6. Salon Subscriptions:\n";
$stmt = $db->query("SELECT ss.*, sp.plan_name, s.salon_name FROM salon_subscriptions ss JOIN subscription_plans sp ON ss.plan_id = sp.plan_id JOIN salons s ON ss.salon_id = s.salon_id");
while ($row = $stmt->fetch()) {
    echo "   - ID: {$row['subscription_id']}, Salon: {$row['salon_name']}, Plan: {$row['plan_name']}, Status: {$row['status']}\n";
}

<?php
require_once __DIR__ . '/config/database.php';
$db = Database::getInstance()->getConnection();

echo "Salon Subscriptions for Salon 1:\n";
$stmt = $db->query("SELECT subscription_id, salon_id, plan_id, start_date, end_date, status FROM salon_subscriptions WHERE salon_id = 1");
while ($row = $stmt->fetch()) {
    print_r($row);
}

echo "\nCurrent date: " . date('Y-m-d') . "\n";

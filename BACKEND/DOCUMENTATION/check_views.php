<?php
require_once __DIR__ . '/../config/database.php';

$db = Database::getInstance()->getConnection();

echo "=== VIEW DEFINITIONS ===\n\n";

try {
    $stmt = $db->query("SHOW CREATE VIEW staff_performance");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "staff_performance:\n";
    echo $result['Create View'] . "\n\n";
} catch (PDOException $e) {
    echo "Error staff_performance: " . $e->getMessage() . "\n\n";
}

try {
    $stmt = $db->query("SHOW CREATE VIEW salon_dashboard");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "salon_dashboard:\n";
    echo $result['Create View'] . "\n\n";
} catch (PDOException $e) {
    echo "Error salon_dashboard: " . $e->getMessage() . "\n\n";
}

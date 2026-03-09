<?php
/**
 * Direct debug test for Create Salon API
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/PasswordHelper.php';

try {
    $db = Database::getInstance()->getConnection();
    echo "Database connection successful\n\n";

    // Test data
    $salonName = "Debug Test Salon";
    $email = "debug" . time() . "@test.com";
    $phone = "9" . rand(100000000, 999999999);
    $adminUsername = 'admin_debug';
    $adminEmail = 'debug@salon.com';
    $adminPassword = bin2hex(random_bytes(8));

    echo "Test data:\n";
    echo "  salonName: $salonName\n";
    echo "  email: $email\n";
    echo "  phone: $phone\n";
    echo "  adminPassword: $adminPassword\n\n";

    $db->beginTransaction();

    // Create salon
    $stmt = $db->prepare("
        INSERT INTO salons
        (salon_name, salon_ownername, email, phone, address, city, state, country, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $salonName,
        'Test Owner',
        $email,
        $phone,
        'Test Address',
        'Test City',
        'Test State',
        'India',
        1
    ]);

    $salonId = $db->lastInsertId();
    echo "Salon created with ID: $salonId\n";

    // Create admin user
    $passwordHash = PasswordHelper::hash($adminPassword);

    $stmt = $db->prepare("
        INSERT INTO users
        (salon_id, username, role, email, password_hash, status)
        VALUES (?, ?, 'ADMIN', ?, ?, 'ACTIVE')
    ");

    $stmt->execute([
        $salonId,
        $adminUsername,
        $adminEmail,
        $passwordHash
    ]);

    $userId = $db->lastInsertId();
    echo "Admin user created with ID: $userId\n";

    $db->commit();
    echo "\n✅ Transaction committed successfully!\n";
    echo "\nResponse data would be:\n";
    echo json_encode([
        "status" => "success",
        "data" => [
            "salon_id" => $salonId,
            "admin_user_id" => $userId,
            "admin_username" => $adminUsername,
            "admin_email" => $adminEmail,
            "generated_password" => $adminPassword,
            "message" => "Admin password auto-generated. Please share with salon admin securely."
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    if (isset($db)) {
        $db->rollBack();
    }
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

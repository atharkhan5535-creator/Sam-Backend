<?php

require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"];
$email = $data["email"];
$password = password_hash($data['password'], PASSWORD_BCRYPT);
$phone = $data["phone"];

// FIXED: 4 placeholders
$stmt = $conn->prepare("INSERT INTO super_admin_login (name, email, password_hash, phone) VALUES (?,?,?,?)");

if (!$stmt) {
    die(json_encode(["error" => "Prepare failed: " . $conn->error]));
}

// FIXED: proper bind_param syntax
$stmt->bind_param("ssss", $name, $email, $password, $phone);

if ($stmt->execute()) {
    echo json_encode(["message" => "User registered successfully"]);
} else {
    echo json_encode(["error" => "Registration failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();

?>
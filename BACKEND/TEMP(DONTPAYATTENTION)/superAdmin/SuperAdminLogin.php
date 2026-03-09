<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require 'config.php';
require '../vendor/autoload.php';
require 'db.php';

use Firebase\JWT\JWT;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Email and password required"]);
    exit;
}

$email = trim($data['email']);
$password = trim($data['password']);

$stmt = $conn->prepare("
    SELECT super_admin_id, name, email, password_hash 
    FROM super_admin_login 
    WHERE email = ?
");

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
    exit;
}

/* -------- CREATE ACCESS TOKEN -------- */

$jti = bin2hex(random_bytes(16));

$payload = [
    "iss" => JWT_ISSUER,
    "aud" => JWT_AUDIENCE,
    "iat" => time(),
    "exp" => time() + JWT_EXPIRE,
    "jti" => $jti,
    "data" => [
        "id" => $user['super_admin_id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "role" => "SUPER_ADMIN"
    ]
];

$access_token = JWT::encode($payload, JWT_SECRET, 'HS256');

/* -------- CREATE REFRESH TOKEN -------- */

$refresh_token = bin2hex(random_bytes(64));
$refresh_expiry = date(
    "Y-m-d H:i:s",
    strtotime("+" . REFRESH_EXPIRE_DAYS . " days")
);

$refreshStmt = $conn->prepare("
    INSERT INTO refresh_tokens
    (user_type, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
");

$user_type = "SUPER_ADMIN";
$user_id = $user['super_admin_id'];

$refreshStmt->bind_param(
    "siss",
    $user_type,
    $user_id,
    $refresh_token,
    $refresh_expiry
);

$refreshStmt->execute();
$refreshStmt->close();

/* -------- RESPONSE -------- */

echo json_encode([
    "message" => "Login successful",
    "access_token" => $access_token,
    "refresh_token" => $refresh_token,
    "expires_in" => JWT_EXPIRE
]);

$stmt->close();
$conn->close();
?>
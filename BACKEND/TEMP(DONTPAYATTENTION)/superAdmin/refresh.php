<?php

header("Content-Type: application/json");

require 'config.php';
require '../vendor/autoload.php';
require 'db.php';

use Firebase\JWT\JWT;

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['refresh_token'])) {
    http_response_code(400);
    echo json_encode(["error" => "Refresh token required"]);
    exit;
}

$refresh_token = $data['refresh_token'];

$stmt = $conn->prepare("
    SELECT * FROM refresh_tokens
    WHERE token = ?
    AND is_revoked = FALSE
    AND expires_at > NOW()
");

$stmt->bind_param("s", $refresh_token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid or expired refresh token"]);
    exit;
}

$row = $result->fetch_assoc();

/* -------- NEW ACCESS TOKEN -------- */

$payload = [
    "iss" => JWT_ISSUER,
    "aud" => JWT_AUDIENCE,
    "iat" => time(),
    "exp" => time() + JWT_EXPIRE,
    "data" => [
        "id" => $row['user_id'],
        "role" => $row['user_type']
    ]
];

$new_access_token = JWT::encode($payload, JWT_SECRET, 'HS256');

/* Update last_used_at */

$updateStmt = $conn->prepare("
    UPDATE refresh_tokens
    SET last_used_at = NOW()
    WHERE token = ?
");
$updateStmt->bind_param("s", $refresh_token);
$updateStmt->execute();

echo json_encode([
    "access_token" => $new_access_token,
    "expires_in" => JWT_EXPIRE
]);
?>
<?php

header("Content-Type: application/json");

require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['refresh_token'])) {
    http_response_code(400);
    echo json_encode(["error" => "Refresh token required"]);
    exit;
}

$refresh_token = $data['refresh_token'];

$stmt = $conn->prepare("
    UPDATE refresh_tokens
    SET is_revoked = TRUE
    WHERE token = ?
");

$stmt->bind_param("s", $refresh_token);
$stmt->execute();

echo json_encode(["message" => "Logout successful"]);
?>
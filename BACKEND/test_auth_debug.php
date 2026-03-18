<?php
// Quick auth test
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display HTML errors
ini_set('log_errors', 1);

header("Content-Type: application/json");

require_once __DIR__ . '/config/constants.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/jwt.php';
require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/middlewares/authenticate.php';

// Test JWT
$payload = ['user_id' => 1, 'role' => 'ADMIN', 'salon_id' => 1];
$token = JWT::generate($payload);

echo json_encode([
    'status' => 'success',
    'token_generated' => true,
    'token' => $token,
    'verify' => JWT::verify($token)
]);

<?php

require 'middleware.php';

$user = verifyJWT();

echo json_encode([
    "message" => "Access granted",
    "user" => $user
]);
?>
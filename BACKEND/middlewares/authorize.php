<?php

require_once __DIR__ . '/authenticate.php';
require_once __DIR__ . '/../core/Response.php';

/*
|--------------------------------------------------------------------------
| AUTHORIZE MIDDLEWARE
|--------------------------------------------------------------------------
| Usage:
| authorize(['ADMIN'])
| authorize(['ADMIN','STAFF'])
*/

function authorize(array $allowedRoles)
{
    authenticate();

    $user = $GLOBALS['auth_user'] ?? null;

    if (!$user) {
        Response::json([
            "status" => "error",
            "message" => "Unauthorized"
        ], 401);
    }
    
    $userRole = $user['role'] ?? null;
    
    if (!$userRole || !in_array($userRole, $allowedRoles)) {
        Response::json([
            "status" => "error",
            "message" => "Forbidden"
        ], 403);
    }
}

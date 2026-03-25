<?php

require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../config/jwt.php';

/*
|--------------------------------------------------------------------------
| AUTHENTICATE MIDDLEWARE
|--------------------------------------------------------------------------
| - Validates access token
| - Verifies JWT signature & expiry
| - Stores authenticated user globally
| - Ensures required payload structure
|
| Note: SUPER_ADMIN does not have salon_id - they manage multiple salons
|       ADMIN, STAFF, CUSTOMER all have salon_id for salon-level access
*/

function authenticate($required = true)
{
    $token = Request::getBearerToken();

    // If token not required and not provided, skip authentication
    if (!$token) {
        if (!$required) {
            // No token, but auth not required - set null user
            $GLOBALS['auth_user'] = null;
            return;
        }

        Response::json([
            "status" => "error",
            "message" => "Access token required"
        ], 401);
    }

    $payload = JWT::verify($token);

    if (!$payload) {
        Response::json([
            "status" => "error",
            "message" => "Invalid or expired token"
        ], 401);
    }

    // Validate essential fields
    $userId = $payload['user_id'] ?? null;
    $role = $payload['role'] ?? null;
    
    if (!$userId || !$role) {
        Response::json([
            "status" => "error",
            "message" => "Malformed token payload"
        ], 401);
    }

    // SUPER_ADMIN doesn't have salon_id - they manage all salons
    // Other roles must have salon_id
    $salonId = $payload['salon_id'] ?? null;
    
    if ($role !== 'SUPER_ADMIN' && !$salonId) {
        Response::json([
            "status" => "error",
            "message" => "Malformed token payload - missing salon_id"
        ], 401);
    }

    // Store authenticated user globally
    $GLOBALS['auth_user'] = $payload;

}

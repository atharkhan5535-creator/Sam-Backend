<?php

require_once __DIR__ . '/UserController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$controller = new UserController();

/*
|--------------------------------------------------------------------------
| USER MANAGEMENT ROUTES
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Salon Admin (for existing salon) - SUPER_ADMIN only
$router->register(
    'POST',
    '/api/admin/salons/{salon_id}/admin',
    function($salonId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->createSalonAdmin($salonId);
    }
);

// 2️⃣ List Users by Salon - SUPER_ADMIN (any salon), ADMIN (own salon only)
$router->register(
    'GET',
    '/api/admin/salons/{salon_id}/users',
    function($salonId) use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->indexBySalon($salonId);
    }
);

// 3️⃣ View User Details - SUPER_ADMIN (any), ADMIN (own salon)
// NOTE: Staff should use StaffController endpoints
$router->register(
    'GET',
    '/api/admin/users/{user_id}',
    function($userId) use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->show($userId);
    }
);

// 4️⃣ Update User - SUPER_ADMIN (any), ADMIN (own salon only)
$router->register(
    'PUT',
    '/api/admin/users/{user_id}',
    function($userId) use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->update($userId);
    }
);

// 5️⃣ Toggle User Status - SUPER_ADMIN only
$router->register(
    'PATCH',
    '/api/admin/users/{user_id}/status',
    function($userId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->toggleStatus($userId);
    }
);

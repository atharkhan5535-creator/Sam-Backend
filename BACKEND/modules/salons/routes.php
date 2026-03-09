<?php

require_once __DIR__ . '/SalonController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$controller = new SalonController();

/*
|--------------------------------------------------------------------------
| SALON MANAGEMENT ROUTES (SUPER_ADMIN ONLY)
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Salon
$router->register(
    'POST',
    '/api/super-admin/salons',
    function() use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->create();
    }
);

// 2️⃣ Update Salon Details
$router->register(
    'PUT',
    '/api/super-admin/salons/{salon_id}',
    function($salonId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->update($salonId);
    }
);

// 3️⃣ Toggle Salon Status
$router->register(
    'PATCH',
    '/api/super-admin/salons/{salon_id}/status',
    function($salonId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->toggleStatus($salonId);
    }
);

// 4️⃣ List Salons
$router->register(
    'GET',
    '/api/super-admin/salons',
    function() use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->index();
    }
);

// 5️⃣ View Salon Details
$router->register(
    'GET',
    '/api/super-admin/salons/{salon_id}',
    function($salonId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->show($salonId);
    }
);

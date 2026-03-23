<?php

require_once __DIR__ . '/ServiceController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$controller = new ServiceController();

/*
|--------------------------------------------------------------------------
| ADMIN ONLY - Upload Service Image
|--------------------------------------------------------------------------
*/
$router->register(
    'POST',
    '/api/admin/services/upload-image',
    function() use ($controller) {
        authorize(['ADMIN']);
        $controller->uploadImage();
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN ONLY - Create Service
|--------------------------------------------------------------------------
*/
$router->register(
    'POST',
    '/api/admin/services',
    function() use ($controller) {
        authorize(['ADMIN']);
        $controller->create();
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN ONLY - Update Service
|--------------------------------------------------------------------------
*/
$router->register(
    'PUT',
    '/api/admin/services/{service_id}',
    function($serviceId) use ($controller) {
        authorize(['ADMIN']);
        $controller->update($serviceId);
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN ONLY - Toggle Service Status
|--------------------------------------------------------------------------
*/
$router->register(
    'PATCH',
    '/api/admin/services/{service_id}/status',
    function($serviceId) use ($controller) {
        authorize(['ADMIN']);
        $controller->toggleStatus($serviceId);
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN, STAFF, CUSTOMER, PUBLIC - List Services
| NOTE: PUBLIC access added for landing page (ACTIVE only)
|--------------------------------------------------------------------------
*/
$router->register(
    'GET',
    '/api/services',
    function() use ($controller) {
        // OPTIONAL AUTH - authenticate(false) reads token if present
        // Public users (no token) can access - ACTIVE only
        // Logged-in users get role-based filtering
        require_once __DIR__ . '/../../middlewares/authenticate.php';
        authenticate(false);  // Optional - doesn't fail if no token
        $controller->index();
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN, STAFF, CUSTOMER, PUBLIC - View Service Details
| NOTE: PUBLIC access added for landing page (ACTIVE only)
|--------------------------------------------------------------------------
*/
$router->register(
    'GET',
    '/api/services/{service_id}',
    function($serviceId) use ($controller) {
        // OPTIONAL AUTH - authenticate(false) reads token if present
        require_once __DIR__ . '/../../middlewares/authenticate.php';
        authenticate(false);  // Optional - doesn't fail if no token
        $controller->show($serviceId);
    }
);

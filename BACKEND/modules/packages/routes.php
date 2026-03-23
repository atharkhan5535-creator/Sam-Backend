<?php

require_once __DIR__ . '/PackageController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$controller = new PackageController();

/*
|--------------------------------------------------------------------------
| ADMIN ONLY - Upload Package Image
|--------------------------------------------------------------------------
*/
$router->register(
    'POST',
    '/api/admin/packages/upload-image',
    function() use ($controller) {
        authorize(['ADMIN']);
        $controller->uploadImage();
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN ONLY - Create Package
|--------------------------------------------------------------------------
*/
$router->register(
    'POST',
    '/api/admin/packages',
    function() use ($controller) {
        authorize(['ADMIN']);
        $controller->create();
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN ONLY - Update Package
|--------------------------------------------------------------------------
*/
$router->register(
    'PUT',
    '/api/admin/packages/{package_id}',
    function($packageId) use ($controller) {
        authorize(['ADMIN']);
        $controller->update($packageId);
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN ONLY - Toggle Package Status
|--------------------------------------------------------------------------
*/
$router->register(
    'PATCH',
    '/api/admin/packages/{package_id}/status',
    function($packageId) use ($controller) {
        authorize(['ADMIN']);
        $controller->toggleStatus($packageId);
    }
);

/*
|--------------------------------------------------------------------------
| ADMIN, STAFF, CUSTOMER, PUBLIC - List Packages
| NOTE: PUBLIC access added for landing page (ACTIVE only)
|--------------------------------------------------------------------------
*/
$router->register(
    'GET',
    '/api/packages',
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
| ADMIN, STAFF, CUSTOMER, PUBLIC - View Package Details
| NOTE: PUBLIC access added for landing page (ACTIVE only)
|--------------------------------------------------------------------------
*/
$router->register(
    'GET',
    '/api/packages/{package_id}',
    function($packageId) use ($controller) {
        // OPTIONAL AUTH - authenticate(false) reads token if present
        require_once __DIR__ . '/../../middlewares/authenticate.php';
        authenticate(false);  // Optional - doesn't fail if no token
        $controller->show($packageId);
    }
);

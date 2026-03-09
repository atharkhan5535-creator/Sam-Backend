<?php

require_once __DIR__ . '/SubscriptionPlanController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$controller = new SubscriptionPlanController();

/*
|--------------------------------------------------------------------------
| SUBSCRIPTION PLAN ROUTES
| - SUPER_ADMIN: Full access (create, update, toggle status)
| - ADMIN: Read-only access (view plans for their salon subscription)
| - STAFF: NO access (subscription management is ownership-level)
| - CUSTOMER: NO access (not applicable to customers)
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Subscription Plan (SUPER_ADMIN only)
$router->register(
    'POST',
    '/api/subscription-plans',
    function() use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->create();
    }
);

// 2️⃣ Update Subscription Plan (SUPER_ADMIN only)
$router->register(
    'PUT',
    '/api/subscription-plans/{plan_id}',
    function($planId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->update($planId);
    }
);

// 3️⃣ List Subscription Plans (SUPER_ADMIN, ADMIN only - NOT STAFF)
$router->register(
    'GET',
    '/api/subscription-plans',
    function() use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->index();
    }
);

// 4️⃣ View Subscription Plan Details (SUPER_ADMIN, ADMIN only - NOT STAFF)
$router->register(
    'GET',
    '/api/subscription-plans/{plan_id}',
    function($planId) use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->show($planId);
    }
);

// 5️⃣ Toggle Plan Status (SUPER_ADMIN only)
$router->register(
    'PATCH',
    '/api/subscription-plans/{plan_id}/status',
    function($planId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->toggleStatus($planId);
    }
);

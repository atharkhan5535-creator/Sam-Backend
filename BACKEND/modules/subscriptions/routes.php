<?php

require_once __DIR__ . '/SubscriptionController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$controller = new SalonSubscriptionController();

/*
|--------------------------------------------------------------------------
| SALON SUBSCRIPTION ROUTES
| - SUPER_ADMIN: Full access (can manage any salon's subscriptions)
| - ADMIN: Access to own salon's subscriptions only
| - STAFF: NO access (subscription management is ownership-level)
| - CUSTOMER: NO access
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Salon Subscription (subscribe to a plan)
$router->register(
    'POST',
    '/api/subscriptions',
    function() use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->create();
    }
);

// 2️⃣ Get Current Active Subscription (MUST be before {subscription_id} route)
$router->register(
    'GET',
    '/api/subscriptions/current',
    function() use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->getCurrentSubscription();
    }
);

// 3️⃣ List Subscription History
$router->register(
    'GET',
    '/api/subscriptions',
    function() use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->index();
    }
);

// 4️⃣ View Subscription Details
$router->register(
    'GET',
    '/api/subscriptions/{subscription_id}',
    function($subscriptionId) use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->show($subscriptionId);
    }
);

// 5️⃣ Update Salon Subscription
$router->register(
    'PUT',
    '/api/subscriptions/{subscription_id}',
    function($subscriptionId) use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->update($subscriptionId);
    }
);

// 6️⃣ Cancel Salon Subscription
$router->register(
    'PATCH',
    '/api/subscriptions/{subscription_id}/cancel',
    function($subscriptionId) use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN']);
        $controller->cancel($subscriptionId);
    }
);

/*
|--------------------------------------------------------------------------
| SUPER_ADMIN SUBSCRIPTION ROUTES (manage all salons)
|--------------------------------------------------------------------------
*/

// 1️⃣ Assign Subscription to Salon (SUPER_ADMIN)
$router->register(
    'POST',
    '/api/super-admin/salons/{salon_id}/subscriptions',
    function($salonId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->createForSalon($salonId);
    }
);

// 2️⃣ Update Subscription Dates (SUPER_ADMIN)
$router->register(
    'PUT',
    '/api/super-admin/subscriptions/{subscription_id}',
    function($subscriptionId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->updateBySuperAdmin($subscriptionId);
    }
);

// 3️⃣ View Salon Subscription History (SUPER_ADMIN)
$router->register(
    'GET',
    '/api/super-admin/salons/{salon_id}/subscriptions',
    function($salonId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->indexBySalon($salonId);
    }
);

// 4️⃣ View Subscription Details (SUPER_ADMIN only) - MUST be before list all
$router->register(
    'GET',
    '/api/super-admin/subscriptions/{subscription_id}',
    function($subscriptionId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->showBySuperAdmin($subscriptionId);
    }
);

// 5️⃣ Generate Subscription Invoice (SUPER_ADMIN only)
$router->register(
    'POST',
    '/api/super-admin/subscriptions/{subscription_id}/generate-invoice',
    function($subscriptionId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->generateInvoice($subscriptionId);
    }
);

// 6️⃣ Renew Subscription (SUPER_ADMIN only)
$router->register(
    'POST',
    '/api/super-admin/subscriptions/{subscription_id}/renew',
    function($subscriptionId) use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->renew($subscriptionId);
    }
);

// 7️⃣ List All Subscriptions Across All Salons (SUPER_ADMIN only) - MUST be last
$router->register(
    'GET',
    '/api/super-admin/subscriptions',
    function() use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->listAll();
    }
);

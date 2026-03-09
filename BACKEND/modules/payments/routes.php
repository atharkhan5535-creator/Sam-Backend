<?php

require_once __DIR__ . '/CustomerPaymentController.php';
require_once __DIR__ . '/SalonPaymentController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$customerPaymentController = new CustomerPaymentController();
$salonPaymentController = new SalonPaymentController();

/*
|--------------------------------------------------------------------------
| CUSTOMER PAYMENT ROUTES
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Payment (ADMIN, STAFF)
$router->register(
    'POST',
    '/api/payments',
    function() use ($customerPaymentController) {
        authorize(['ADMIN', 'STAFF']);
        $customerPaymentController->create();
    }
);

// 2️⃣ List Payments (ADMIN, STAFF, CUSTOMER)
$router->register(
    'GET',
    '/api/payments',
    function() use ($customerPaymentController) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $customerPaymentController->index();
    }
);

// 3️⃣ View Payment Details (ADMIN, STAFF, CUSTOMER)
$router->register(
    'GET',
    '/api/payments/{payment_id}',
    function($paymentId) use ($customerPaymentController) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $customerPaymentController->show($paymentId);
    }
);

/*
|--------------------------------------------------------------------------
| SALON PAYMENT ROUTES (ADMIN only)
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Salon Payment (ADMIN only)
$router->register(
    'POST',
    '/api/salon/payments',
    function() use ($salonPaymentController) {
        authorize(['ADMIN']);
        $salonPaymentController->create();
    }
);

// 2️⃣ List Salon Payments (ADMIN only)
$router->register(
    'GET',
    '/api/salon/payments',
    function() use ($salonPaymentController) {
        authorize(['ADMIN']);
        $salonPaymentController->index();
    }
);

// 3️⃣ View Salon Payment Details (ADMIN only)
$router->register(
    'GET',
    '/api/salon/payments/{payment_id}',
    function($paymentId) use ($salonPaymentController) {
        authorize(['ADMIN']);
        $salonPaymentController->show($paymentId);
    }
);

/*
|--------------------------------------------------------------------------
| SUPER_ADMIN SALON PAYMENT ROUTES
|--------------------------------------------------------------------------
*/

// 1️⃣ Record Payment for Salon Invoice (SUPER_ADMIN)
$router->register(
    'POST',
    '/api/super-admin/invoices/salon/{invoice_salon_id}/payments',
    function($invoiceSalonId) use ($salonPaymentController) {
        authorize(['SUPER_ADMIN']);
        $salonPaymentController->recordPayment($invoiceSalonId);
    }
);

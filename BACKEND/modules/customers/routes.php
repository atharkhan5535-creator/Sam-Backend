<?php

require_once __DIR__ . '/CustomerController.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$customerController = new CustomerController();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTE
|--------------------------------------------------------------------------
*/

// Customer Self Registration (public)
$router->register('POST', '/api/customers/register', [
    $customerController,
    'register'
]);


/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES (ADMIN, STAFF)
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Customer (Manual)
$router->register('POST', '/api/customers/create', function() use ($customerController) {
    authorize(['ADMIN','STAFF']);
    $customerController->create();
});

// 2️⃣ Update Customer (Admin/Staff)
$router->register('PATCH', '/api/customers/update/{customer_id}', function($customer_id) use ($customerController) {
    authorize(['ADMIN','STAFF']);
    $customerController->update($customer_id);
});

// 3️⃣ Soft Delete Customer
$router->register('PATCH', '/api/customers/status/{customer_id}', function($customer_id) use ($customerController) {
    authorize(['ADMIN','STAFF']);
    $customerController->softDelete($customer_id);
});

// 4️⃣ List Customers
$router->register('GET', '/api/customers/list', function() use ($customerController) {
    authorize(['ADMIN','STAFF']);
    $customerController->index();
});


/*
|--------------------------------------------------------------------------
| MIXED ACCESS (ADMIN, STAFF, CUSTOMER)
|--------------------------------------------------------------------------
*/

// 5️⃣ View Customer Profile
$router->register('GET', '/api/customers/view/{customer_id}', function($customer_id) use ($customerController) {
    authorize(['ADMIN','STAFF','CUSTOMER']);
    $customerController->show($customer_id);
});


/*
|--------------------------------------------------------------------------
| CUSTOMER SELF SERVICE
|--------------------------------------------------------------------------
*/

// 6️⃣ Update Own Profile
$router->register('PATCH', '/api/customers/me', function() use ($customerController) {
    authorize(['CUSTOMER']);
    $customerController->updateMe();
});

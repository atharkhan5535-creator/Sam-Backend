<?php

require_once __DIR__ . '/CustomerInvoiceController.php';
require_once __DIR__ . '/SalonInvoiceController.php';
require_once __DIR__ . '/../payments/CustomerPaymentController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$invoiceController = new CustomerInvoiceController();
$salonInvoiceController = new SalonInvoiceController();
$paymentController = new CustomerPaymentController();

/*
|--------------------------------------------------------------------------
| CUSTOMER INVOICE ROUTES
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Invoice (ADMIN, STAFF)
$router->register(
    'POST',
    '/api/invoices',
    function() use ($invoiceController) {
        authorize(['ADMIN', 'STAFF']);
        $invoiceController->create();
    }
);

// 2️⃣ Update Invoice (ADMIN, STAFF)
$router->register(
    'PUT',
    '/api/invoices/{invoice_id}',
    function($invoiceId) use ($invoiceController) {
        authorize(['ADMIN', 'STAFF']);
        $invoiceController->update($invoiceId);
    }
);

// 3️⃣ List Invoices (ADMIN, STAFF, CUSTOMER)
$router->register(
    'GET',
    '/api/invoices',
    function() use ($invoiceController) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $invoiceController->index();
    }
);

// 4️⃣ View Invoice Details (ADMIN, STAFF, CUSTOMER)
$router->register(
    'GET',
    '/api/invoices/{invoice_id}',
    function($invoiceId) use ($invoiceController) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $invoiceController->show($invoiceId);
    }
);

// 5️⃣ Get Invoice by Appointment ID (ADMIN, STAFF, CUSTOMER)
$router->register(
    'GET',
    '/api/invoices/appointment/{appointment_id}',
    function($appointmentId) use ($invoiceController) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $invoiceController->getByAppointment($appointmentId);
    }
);

/*
|--------------------------------------------------------------------------
| CUSTOMER INVOICE PAYMENT ROUTES
|--------------------------------------------------------------------------
*/

// 6️⃣ Record Payment for Customer Invoice (ADMIN, STAFF only)
// NOTE: Customers cannot create payments - only ADMIN/STAFF can record payments
$router->register(
    'POST',
    '/api/invoices/customer/{invoice_customer_id}/payments',
    function($invoiceId) use ($invoiceController) {
        authorize(['ADMIN', 'STAFF']);
        $invoiceController->recordPayment($invoiceId);
    }
);

// 7️⃣ Get Invoice Payments (ADMIN, STAFF, CUSTOMER)
// CUSTOMER can only VIEW payments for their own invoices
$router->register(
    'GET',
    '/api/invoices/customer/{invoice_customer_id}/payments',
    function($invoiceId) use ($invoiceController) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $invoiceController->getPayments($invoiceId);
    }
);

/*
|--------------------------------------------------------------------------
| SALON INVOICE ROUTES (ADMIN only)
|--------------------------------------------------------------------------
*/

// 1️⃣ List Salon Invoices
$router->register(
    'GET',
    '/api/salon/invoices',
    function() use ($salonInvoiceController) {
        authorize(['ADMIN']);
        $salonInvoiceController->index();
    }
);

// 2️⃣ View Salon Invoice Details
$router->register(
    'GET',
    '/api/salon/invoices/{invoice_salon_id}',
    function($invoiceSalonId) use ($salonInvoiceController) {
        authorize(['ADMIN']);
        $salonInvoiceController->show($invoiceSalonId);
    }
);

// 3️⃣ Update Salon Invoice
$router->register(
    'PUT',
    '/api/salon/invoices/{invoice_salon_id}',
    function($invoiceSalonId) use ($salonInvoiceController) {
        authorize(['ADMIN']);
        $salonInvoiceController->update($invoiceSalonId);
    }
);

// 4️⃣ Get Salon Invoice by Subscription ID
$router->register(
    'GET',
    '/api/salon/invoices/subscription/{subscription_id}',
    function($subscriptionId) use ($salonInvoiceController) {
        authorize(['ADMIN']);
        $salonInvoiceController->getBySubscription($subscriptionId);
    }
);

/*
|--------------------------------------------------------------------------
| SUPER_ADMIN SALON INVOICE ROUTES
|--------------------------------------------------------------------------
*/

// 1️⃣ Generate Salon Invoice (SUPER_ADMIN)
$router->register(
    'POST',
    '/api/super-admin/invoices/salon',
    function() use ($salonInvoiceController) {
        authorize(['SUPER_ADMIN']);
        $salonInvoiceController->create();
    }
);

// 2️⃣ View Salon Invoice (SUPER_ADMIN)
$router->register(
    'GET',
    '/api/super-admin/invoices/salon/{invoice_salon_id}',
    function($invoiceSalonId) use ($salonInvoiceController) {
        authorize(['SUPER_ADMIN']);
        $salonInvoiceController->show($invoiceSalonId);
    }
);

// 3️⃣ List Salon Invoices (SUPER_ADMIN)
$router->register(
    'GET',
    '/api/super-admin/invoices/salon',
    function() use ($salonInvoiceController) {
        authorize(['SUPER_ADMIN']);
        $salonInvoiceController->index();
    }
);

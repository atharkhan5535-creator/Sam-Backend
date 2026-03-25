<?php

require_once __DIR__ . '/ReportController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$controller = new ReportController();

/*
|--------------------------------------------------------------------------
| REPORT ROUTES
| SUPER_ADMIN: Can access all reports (platform-wide or specific salon)
| ADMIN/STAFF: Can only access their own salon reports
|--------------------------------------------------------------------------
*/

// 1️⃣ Sales Report (SUPER_ADMIN, ADMIN, STAFF)
$router->register(
    'GET',
    '/api/reports/sales',
    function() use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN', 'STAFF']);
        $controller->sales();
    }
);

// 2️⃣ Appointment Report (SUPER_ADMIN, ADMIN, STAFF)
$router->register(
    'GET',
    '/api/reports/appointments',
    function() use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN', 'STAFF']);
        $controller->appointments();
    }
);

// 3️⃣ Staff Performance Report (ADMIN, STAFF only - salon-level)
$router->register(
    'GET',
    '/api/reports/staff-performance',
    function() use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->staffPerformance();
    }
);

// 4️⃣ Service-wise Revenue Report (SUPER_ADMIN, ADMIN, STAFF)
$router->register(
    'GET',
    '/api/reports/services',
    function() use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN', 'STAFF']);
        $controller->services();
    }
);

// 5️⃣ Package-wise Revenue Report (SUPER_ADMIN, ADMIN, STAFF)
$router->register(
    'GET',
    '/api/reports/packages',
    function() use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN', 'STAFF']);
        $controller->packages();
    }
);

// 6️⃣ Customer Visit Report (ADMIN, STAFF only - salon-level)
$router->register(
    'GET',
    '/api/reports/customers',
    function() use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->customers();
    }
);

// 7️⃣ Inventory Usage Report (ADMIN, STAFF only - salon-level)
$router->register(
    'GET',
    '/api/reports/inventory',
    function() use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->inventory();
    }
);

// 8️⃣ Incentive Payout Report (ADMIN, STAFF only - salon-level)
$router->register(
    'GET',
    '/api/reports/incentives',
    function() use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->incentives();
    }
);

// 9️⃣ Tax Report (GST) (SUPER_ADMIN, ADMIN, STAFF)
$router->register(
    'GET',
    '/api/reports/tax',
    function() use ($controller) {
        authorize(['SUPER_ADMIN', 'ADMIN', 'STAFF']);
        $controller->tax();
    }
);

// 🔟 Dashboard Summary (ADMIN, STAFF) - NEW endpoint for pre-calculated dashboard stats
$router->register(
    'GET',
    '/api/reports/dashboard-summary',
    function() use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->getDashboardSummary();
    }
);

// 1️⃣1️⃣ Super Admin Dashboard (SUPER_ADMIN only) - Platform-wide metrics
$router->register(
    'GET',
    '/api/reports/super-admin-dashboard',
    function() use ($controller) {
        authorize(['SUPER_ADMIN']);
        $controller->getSuperAdminDashboard();
    }
);

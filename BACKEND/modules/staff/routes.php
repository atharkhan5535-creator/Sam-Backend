<?php

require_once __DIR__ . '/StaffController.php';
require_once __DIR__ . '/StaffDocumentController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$staffController = new StaffController();
$documentController = new StaffDocumentController();

/*
|--------------------------------------------------------------------------
| STAFF MANAGEMENT ROUTES
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Staff (ADMIN only)
$router->register(
    'POST',
    '/api/admin/staff',
    function() use ($staffController) {
        authorize(['ADMIN']);
        $staffController->create();
    }
);

// 2️⃣ Update Staff Details (ADMIN only)
$router->register(
    'PUT',
    '/api/admin/staff/{staff_id}',
    function($staffId) use ($staffController) {
        authorize(['ADMIN']);
        $staffController->update($staffId);
    }
);

// 3️⃣ Toggle Staff Status (ADMIN only)
$router->register(
    'PATCH',
    '/api/admin/staff/{staff_id}/status',
    function($staffId) use ($staffController) {
        authorize(['ADMIN']);
        $staffController->toggleStatus($staffId);
    }
);

// 4️⃣ List Staff (ADMIN only)
$router->register(
    'GET',
    '/api/admin/staff',
    function() use ($staffController) {
        authorize(['ADMIN']);
        $staffController->index();
    }
);

// 5️⃣ View Staff Details (ADMIN, STAFF)
$router->register(
    'GET',
    '/api/admin/staff/{staff_id}',
    function($staffId) use ($staffController) {
        authorize(['ADMIN', 'STAFF']);
        $staffController->show($staffId);
    }
);

/*
|--------------------------------------------------------------------------
| STAFF INCENTIVE ROUTES
|--------------------------------------------------------------------------
*/

// 6️⃣ Generate Staff Incentive (ADMIN only)
$router->register(
    'POST',
    '/api/staff/incentives',
    function() use ($staffController) {
        authorize(['ADMIN']);
        $staffController->createIncentive();
    }
);

// 7️⃣ Incentive Payout (ADMIN only)
$router->register(
    'POST',
    '/api/staff/incentives/{incentive_id}/payout',
    function($incentiveId) use ($staffController) {
        authorize(['ADMIN']);
        $staffController->createPayout($incentiveId);
    }
);

// 7️⃣BATCH Incentive Payout (ADMIN only)
$router->register(
    'POST',
    '/api/staff/incentives/batch-payout',
    function() use ($staffController) {
        authorize(['ADMIN']);
        $staffController->createBatchPayout();
    }
);

// 8️⃣ Get Unpaid Incentives by Staff (ADMIN only)
$router->register(
    'GET',
    '/api/staff/incentives/unpaid/{staff_id}',
    function($staffId) use ($staffController) {
        authorize(['ADMIN']);
        $staffController->getUnpaidIncentives($staffId);
    }
);

// 9️⃣ Get Incentive History by Staff (ADMIN only)
$router->register(
    'GET',
    '/api/staff/incentives/history/{staff_id}',
    function($staffId) use ($staffController) {
        authorize(['ADMIN']);
        $staffController->getIncentiveHistory($staffId);
    }
);

/*
|--------------------------------------------------------------------------
| STAFF DOCUMENT ROUTES
|--------------------------------------------------------------------------
*/

// ➕ Add Staff Document (ADMIN only)
$router->register(
    'POST',
    '/api/admin/staff/{staff_id}/documents',
    function($staffId) use ($documentController) {
        authorize(['ADMIN']);
        $documentController->create($staffId);
    }
);

// 📄 List Staff Documents (ADMIN, STAFF)
$router->register(
    'GET',
    '/api/admin/staff/{staff_id}/documents',
    function($staffId) use ($documentController) {
        authorize(['ADMIN', 'STAFF']);
        $documentController->index($staffId);
    }
);

// 📄 View Staff Document (ADMIN, STAFF)
$router->register(
    'GET',
    '/api/admin/staff/{staff_id}/documents/{doc_id}',
    function($staffId, $docId) use ($documentController) {
        authorize(['ADMIN', 'STAFF']);
        $documentController->show($staffId, $docId);
    }
);

// 🗑️ Delete Staff Document (ADMIN only)
$router->register(
    'DELETE',
    '/api/admin/staff/{staff_id}/documents/{doc_id}',
    function($staffId, $docId) use ($documentController) {
        authorize(['ADMIN']);
        $documentController->delete($staffId, $docId);
    }
);

/*
|--------------------------------------------------------------------------
| PUBLIC STAFF LIST (For Customer Booking)
|--------------------------------------------------------------------------
*/
$router->register(
    'GET',
    '/api/staff',
    function() use ($staffController) {
        // PUBLIC - No authentication required
        $staffController->publicList();
    }
);

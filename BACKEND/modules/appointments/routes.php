<?php

require_once __DIR__ . '/AppointmentController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$controller = new AppointmentController();

/*
|--------------------------------------------------------------------------
| APPOINTMENT MANAGEMENT ROUTES
|--------------------------------------------------------------------------
*/

// 1️⃣ Create Appointment (ADMIN, STAFF, CUSTOMER)
$router->register(
    'POST',
    '/api/appointments',
    function() use ($controller) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $controller->create();
    }
);

// 2️⃣ Update Appointment (ADMIN, STAFF)
$router->register(
    'PUT',
    '/api/appointments/{appointment_id}',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->update($appointmentId);
    }
);

// 3️⃣ Cancel Appointment (ADMIN, STAFF, CUSTOMER)
$router->register(
    'PATCH',
    '/api/appointments/{appointment_id}/cancel',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $controller->cancel($appointmentId);
    }
);

// 4️⃣ List Appointments (ADMIN, STAFF, CUSTOMER)
$router->register(
    'GET',
    '/api/appointments',
    function() use ($controller) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $controller->index();
    }
);

// 5️⃣ View Appointment Details (ADMIN, STAFF, CUSTOMER)
$router->register(
    'GET',
    '/api/appointments/{appointment_id}',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER']);
        $controller->show($appointmentId);
    }
);

// 6️⃣ Submit Feedback (CUSTOMER only)
$router->register(
    'POST',
    '/api/appointments/{appointment_id}/feedback',
    function($appointmentId) use ($controller) {
        authorize(['CUSTOMER']);
        $controller->submitFeedback($appointmentId);
    }
);

// 7️⃣ Approve Appointment (ADMIN, STAFF)
$router->register(
    'PATCH',
    '/api/appointments/{appointment_id}/approve',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->approve($appointmentId);
    }
);

// 8️⃣ Complete Appointment (ADMIN, STAFF)
$router->register(
    'PATCH',
    '/api/appointments/{appointment_id}/complete',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->complete($appointmentId);
    }
);

// 9️⃣ Add/Update Service to Appointment (ADMIN, STAFF)
// PUT acts as upsert: inserts if not exists, updates if exists
$router->register(
    'PUT',
    '/api/appointments/{appointment_id}/services/{service_id}',
    function($appointmentId, $serviceId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->addService($appointmentId, $serviceId);
    }
);

// 🔟 Update Appointment Service (ADMIN, STAFF)
$router->register(
    'PATCH',
    '/api/appointments/{appointment_id}/services/{service_id}',
    function($appointmentId, $serviceId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->updateService($appointmentId, $serviceId);
    }
);

// 1️⃣0️⃣➁ Remove Service from Appointment (ADMIN, STAFF)
$router->register(
    'DELETE',
    '/api/appointments/{appointment_id}/services/{service_id}',
    function($appointmentId, $serviceId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->removeService($appointmentId, $serviceId);
    }
);

// 1️⃣1️⃣ Add Package to Appointment (ADMIN, STAFF)
$router->register(
    'POST',
    '/api/appointments/{appointment_id}/packages',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $data = json_decode(file_get_contents("php://input"), true);
        $packageId = $data['package_id'] ?? null;
        if (!$packageId) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Package ID is required"]);
            exit;
        }
        $controller->addPackage($appointmentId, $packageId);
    }
);

// 1️⃣2️⃣ Update Package in Appointment (ADMIN, STAFF)
$router->register(
    'PUT',
    '/api/appointments/{appointment_id}/packages/{package_id}',
    function($appointmentId, $packageId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->updatePackage($appointmentId, $packageId);
    }
);

// 1️⃣3️⃣ Remove Package from Appointment (ADMIN, STAFF)
$router->register(
    'DELETE',
    '/api/appointments/{appointment_id}/packages/{package_id}',
    function($appointmentId, $packageId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->removePackage($appointmentId, $packageId);
    }
);

// 1️⃣4️⃣ Generate Invoice from Appointment (ADMIN, STAFF)
$router->register(
    'POST',
    '/api/appointments/{appointment_id}/invoice',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF']);
        $controller->generateInvoice($appointmentId);
    }
);

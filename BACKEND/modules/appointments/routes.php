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

// 1️⃣ Create Appointment (ADMIN, STAFF, CUSTOMER, SUPER_ADMIN)
$router->register(
    'POST',
    '/api/appointments',
    function() use ($controller) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER', 'SUPER_ADMIN']);
        $controller->create();
    }
);

// 2️⃣ Update Appointment (ADMIN, STAFF, SUPER_ADMIN)
$router->register(
    'PUT',
    '/api/appointments/{appointment_id}',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
        $controller->update($appointmentId);
    }
);

// 3️⃣ Cancel Appointment (ADMIN, STAFF, CUSTOMER, SUPER_ADMIN)
$router->register(
    'PATCH',
    '/api/appointments/{appointment_id}/cancel',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER', 'SUPER_ADMIN']);
        $controller->cancel($appointmentId);
    }
);

// 4️⃣ List Appointments (ADMIN, STAFF, CUSTOMER, SUPER_ADMIN)
$router->register(
    'GET',
    '/api/appointments',
    function() use ($controller) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER', 'SUPER_ADMIN']);
        $controller->index();
    }
);

// 5️⃣ View Appointment Details (ADMIN, STAFF, CUSTOMER, SUPER_ADMIN)
$router->register(
    'GET',
    '/api/appointments/{appointment_id}',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'CUSTOMER', 'SUPER_ADMIN']);
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

// 7️⃣ Approve Appointment (ADMIN, STAFF, SUPER_ADMIN)
$router->register(
    'PATCH',
    '/api/appointments/{appointment_id}/approve',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
        $controller->approve($appointmentId);
    }
);

// 8️⃣ Complete Appointment (ADMIN, STAFF, SUPER_ADMIN)
$router->register(
    'PATCH',
    '/api/appointments/{appointment_id}/complete',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
        $controller->complete($appointmentId);
    }
);

// 9️⃣ Add/Update Service to Appointment (ADMIN, STAFF, SUPER_ADMIN)
// PUT acts as upsert: inserts if not exists, updates if exists
$router->register(
    'PUT',
    '/api/appointments/{appointment_id}/services/{service_id}',
    function($appointmentId, $serviceId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
        $controller->addService($appointmentId, $serviceId);
    }
);

// 🔟 Update Appointment Service (ADMIN, STAFF, SUPER_ADMIN)
$router->register(
    'PATCH',
    '/api/appointments/{appointment_id}/services/{service_id}',
    function($appointmentId, $serviceId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
        $controller->updateService($appointmentId, $serviceId);
    }
);

// 1️⃣0️⃣➁ Remove Service from Appointment (ADMIN, STAFF, SUPER_ADMIN)
$router->register(
    'DELETE',
    '/api/appointments/{appointment_id}/services/{service_id}',
    function($appointmentId, $serviceId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
        $controller->removeService($appointmentId, $serviceId);
    }
);

// 1️⃣1️⃣ Add Package to Appointment (ADMIN, STAFF, SUPER_ADMIN)
$router->register(
    'POST',
    '/api/appointments/{appointment_id}/packages',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
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

// 1️⃣2️⃣ Update Package in Appointment (ADMIN, STAFF, SUPER_ADMIN)
$router->register(
    'PUT',
    '/api/appointments/{appointment_id}/packages/{package_id}',
    function($appointmentId, $packageId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
        $controller->updatePackage($appointmentId, $packageId);
    }
);

// 1️⃣3️⃣ Remove Package from Appointment (ADMIN, STAFF, SUPER_ADMIN)
$router->register(
    'DELETE',
    '/api/appointments/{appointment_id}/packages/{package_id}',
    function($appointmentId, $packageId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
        $controller->removePackage($appointmentId, $packageId);
    }
);

// 1️⃣4️⃣ Generate Invoice from Appointment (ADMIN, STAFF, SUPER_ADMIN)
$router->register(
    'POST',
    '/api/appointments/{appointment_id}/invoice',
    function($appointmentId) use ($controller) {
        authorize(['ADMIN', 'STAFF', 'SUPER_ADMIN']);
        $controller->generateInvoice($appointmentId);
    }
);

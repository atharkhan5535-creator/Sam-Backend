<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class AppointmentController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE APPOINTMENT (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function create()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;
        $userRole = $auth['role'] ?? null;
        $userId = $auth['user_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $customerId = $data['customer_id'] ?? null;
        $appointmentDate = $data['appointment_date'] ?? null;
        $startTime = $data['start_time'] ?? null;
        $estimatedDuration = $data['estimated_duration'] ?? null;
        $notes = trim($data['notes'] ?? '');
        $services = $data['services'] ?? [];
        $packages = $data['packages'] ?? [];

        // If CUSTOMER, they can only book for themselves
        if ($userRole === 'CUSTOMER') {
            $customerId = $auth['customer_id'];
        }

        // 1️⃣ Required Fields Validation
        if (!$customerId || !$appointmentDate || !$startTime) {
            Response::json(["status" => "error", "message" => "Customer ID, appointment date, and start time are required"], 400);
        }

        // 2️⃣ Services/Packages Required
        if (empty($services) && empty($packages)) {
            Response::json(["status" => "error", "message" => "At least one service or package is required"], 400);
        }

        // 3️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $appointmentDate)) {
            Response::json(["status" => "error", "message" => "Invalid date format (use YYYY-MM-DD)"], 400);
        }

        // 4️⃣ Past Date Validation
        if ($appointmentDate < date('Y-m-d')) {
            Response::json(["status" => "error", "message" => "Cannot book appointments in the past"], 400);
        }

        // 5️⃣ Time Format Validation
        if (!DateTime::createFromFormat('H:i:s', $startTime)) {
            Response::json(["status" => "error", "message" => "Invalid time format (use HH:MM:SS)"], 400);
        }

        // 6️⃣ Duration Range Validation (1-1440 minutes = 24 hours max)
        if ($estimatedDuration === null || $estimatedDuration <= 0 || $estimatedDuration > 1440) {
            Response::json(["status" => "error", "message" => "Duration must be between 1 and 1440 minutes"], 400);
        }

        // Verify customer belongs to salon
        $stmt = $this->db->prepare("SELECT customer_id FROM customers WHERE customer_id = ? AND salon_id = ?");
        $stmt->execute([$customerId, $salonId]);
        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Customer not found in this salon"], 404);
        }

        // Calculate total amount
        $totalAmount = 0;

        // Validate and calculate services total
        $serviceDetails = [];
        if (!empty($services)) {
            $serviceIds = array_column($services, 'service_id');
            $placeholders = implode(',', array_fill(0, count($serviceIds), '?'));
            $stmt = $this->db->prepare("
                SELECT service_id, price FROM services
                WHERE service_id IN ($placeholders) AND salon_id = ?
            ");
            $params = array_merge($serviceIds, [$salonId]);
            $stmt->execute($params);
            $existingServices = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($existingServices) !== count($serviceIds)) {
                Response::json(["status" => "error", "message" => "One or more services not found"], 404);
            }

            foreach ($services as $service) {
                $serviceId = $service['service_id'];
                $servicePrice = $service['price'] ?? 0;
                $discountAmount = $service['discount_amount'] ?? 0;
                $serviceStartTime = $service['start_time'] ?? null;
                $serviceEndTime = $service['end_time'] ?? null;

                // Validate service price (>= 0)
                if ($servicePrice < 0) {
                    Response::json(["status" => "error", "message" => "Invalid service price"], 400);
                }

                // Validate service discount (>= 0 and <= price)
                if ($discountAmount < 0 || $discountAmount > $servicePrice) {
                    Response::json(["status" => "error", "message" => "Invalid service discount"], 400);
                }

                $serviceDetails[] = [
                    'service_id' => $serviceId,
                    'service_price' => $servicePrice,
                    'discount_amount' => $discountAmount,
                    'final_price' => $servicePrice - $discountAmount,
                    'start_time' => $serviceStartTime,
                    'end_time' => $serviceEndTime
                ];

                $totalAmount += ($servicePrice - $discountAmount);
            }
        }

        // Validate and calculate packages total
        $packageDetails = [];
        if (!empty($packages)) {
            $packageIds = array_column($packages, 'package_id');
            $placeholders = implode(',', array_fill(0, count($packageIds), '?'));
            $stmt = $this->db->prepare("
                SELECT package_id, total_price FROM packages
                WHERE package_id IN ($placeholders) AND salon_id = ?
            ");
            $params = array_merge($packageIds, [$salonId]);
            $stmt->execute($params);
            $existingPackages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($existingPackages) !== count($packageIds)) {
                Response::json(["status" => "error", "message" => "One or more packages not found"], 404);
            }

            foreach ($packages as $package) {
                $packageId = $package['package_id'];
                $packagePrice = $package['price'] ?? 0;
                $discountAmount = $package['discount_amount'] ?? 0;

                // Validate package price (>= 0)
                if ($packagePrice < 0) {
                    Response::json(["status" => "error", "message" => "Invalid package price"], 400);
                }

                // Validate package discount (>= 0 and <= price)
                if ($discountAmount < 0 || $discountAmount > $packagePrice) {
                    Response::json(["status" => "error", "message" => "Invalid package discount"], 400);
                }

                $packageDetails[] = [
                    'package_id' => $packageId,
                    'package_price' => $packagePrice,
                    'discount_amount' => $discountAmount,
                    'final_price' => $packagePrice - $discountAmount
                ];

                $totalAmount += ($packagePrice - $discountAmount);
            }
        }

        $discountAmount = $data['discount_amount'] ?? 0;
        
        // Validate appointment discount (>= 0 and <= total)
        if ($discountAmount < 0 || $discountAmount > $totalAmount) {
            Response::json(["status" => "error", "message" => "Invalid discount amount"], 400);
        }
        
        $finalAmount = $totalAmount - $discountAmount;

        try {
            $this->db->beginTransaction();

            // Calculate end time
            $endTime = date('H:i:s', strtotime($startTime) + ($estimatedDuration * 60));

            // Insert appointment
            $stmt = $this->db->prepare("
                INSERT INTO appointments
                (salon_id, customer_id, appointment_date, start_time, end_time, estimated_duration, 
                 total_amount, discount_amount, final_amount, status, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, NOW(), NOW())
            ");

            $stmt->execute([
                $salonId,
                $customerId,
                $appointmentDate,
                $startTime,
                $endTime,
                $estimatedDuration,
                $totalAmount,
                $discountAmount,
                $finalAmount,
                $notes ?: null
            ]);

            $appointmentId = $this->db->lastInsertId();

            // Insert appointment services
            if (!empty($serviceDetails)) {
                $stmt = $this->db->prepare("
                    INSERT INTO appointment_services
                    (appointment_id, service_id, service_price, discount_amount, final_price,
                     start_time, end_time, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())
                ");

                foreach ($serviceDetails as $service) {
                    $stmt->execute([
                        $appointmentId,
                        $service['service_id'],
                        $service['service_price'],
                        $service['discount_amount'],
                        $service['final_price'],
                        $service['start_time'] ?: null,
                        $service['end_time'] ?: null
                    ]);
                }
            }

            // Insert appointment packages
            if (!empty($packageDetails)) {
                $stmt = $this->db->prepare("
                    INSERT INTO appointment_packages
                    (appointment_id, package_id, package_price, discount_amount, final_price,
                     status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())
                ");

                foreach ($packageDetails as $package) {
                    $stmt->execute([
                        $appointmentId,
                        $package['package_id'],
                        $package['package_price'],
                        $package['discount_amount'],
                        $package['final_price']
                    ]);
                }
            }

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "appointment_id" => $appointmentId
                ]
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to create appointment: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ UPDATE APPOINTMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function update($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify appointment belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ?");
        $stmt->execute([$appointmentId, $salonId]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // All allowed fields for update
        $allowedFields = [
            'appointment_date',
            'start_time',
            'end_time',
            'estimated_duration',
            'discount_amount',
            'final_amount',
            'total_amount',
            'notes',
            'cancellation_reason',
            'status'
        ];

        $updates = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        // Special handling for customer_id (requires separate validation)
        if (isset($data['customer_id'])) {
            // Verify new customer exists and belongs to same salon
            $stmt = $this->db->prepare("SELECT customer_id FROM customers WHERE customer_id = ? AND salon_id = ?");
            $stmt->execute([$data['customer_id'], $salonId]);
            if (!$stmt->fetch()) {
                Response::json(["status" => "error", "message" => "Invalid customer_id"], 400);
            }
            $updates[] = "customer_id = ?";
            $values[] = $data['customer_id'];
        }

        if (empty($updates)) {
            Response::json(["status" => "error", "message" => "No valid fields to update"], 400);
        }

        $values[] = $appointmentId;
        $values[] = $salonId;

        $sql = "UPDATE appointments SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE appointment_id = ? AND salon_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ CANCEL APPOINTMENT (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function cancel($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $cancellationReason = trim($data['cancellation_reason'] ?? '');

        // ✅ SECURITY FIX: Check authorization BEFORE fetching appointment data
        // If CUSTOMER, include customer_id in WHERE clause to prevent unauthorized access
        if ($auth['role'] === 'CUSTOMER') {
            $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ? AND customer_id = ?");
            $stmt->execute([$appointmentId, $salonId, $auth['customer_id']]);
        } else {
            // ADMIN/STAFF can cancel any appointment in their salon
            $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ?");
            $stmt->execute([$appointmentId, $salonId]);
        }

        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        $stmt = $this->db->prepare("
            UPDATE appointments
            SET status = 'CANCELLED', cancellation_reason = ?, updated_at = NOW()
            WHERE appointment_id = ? AND salon_id = ?
        ");

        $stmt->execute([$cancellationReason ?: null, $appointmentId, $salonId]);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ LIST APPOINTMENTS (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;
        $userRole = $auth['role'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
            return;
        }

        $status = $_GET['status'] ?? null;
        $appointmentDate = $_GET['date'] ?? null;

        $sql = "
            SELECT a.*, c.name AS customer_name, c.phone AS customer_phone
            FROM appointments a
            INNER JOIN customers c ON a.customer_id = c.customer_id
            WHERE a.salon_id = ?
        ";

        $params = [$salonId];

        // CUSTOMER can only see their own appointments
        if ($userRole === 'CUSTOMER') {
            $sql .= " AND a.customer_id = ?";
            $params[] = $auth['customer_id'] ?? null;
        }

        if ($status) {
            $sql .= " AND a.status = ?";
            $params[] = $status;
        }

        if ($appointmentDate) {
            $sql .= " AND a.appointment_date = ?";
            $params[] = $appointmentDate;
        }

        $sql .= " ORDER BY a.appointment_date DESC, a.start_time DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get services and packages for each appointment
        foreach ($appointments as &$appointment) {
            // Get services
            $stmt = $this->db->prepare("
                SELECT asvc.service_id, s.service_name, svc.staff_id, asvc.service_price,
                       asvc.discount_amount, asvc.final_price, asvc.start_time, asvc.end_time, asvc.status
                FROM appointment_services asvc
                INNER JOIN services s ON asvc.service_id = s.service_id
                INNER JOIN services svc ON asvc.service_id = svc.service_id
                WHERE asvc.appointment_id = ?
            ");
            $stmt->execute([$appointment['appointment_id']]);
            $appointment['services'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get packages
            $stmt = $this->db->prepare("
                SELECT ap.package_id, p.package_name, ap.package_price,
                       ap.discount_amount, ap.final_price, ap.status
                FROM appointment_packages ap
                INNER JOIN packages p ON ap.package_id = p.package_id
                WHERE ap.appointment_id = ?
            ");
            $stmt->execute([$appointment['appointment_id']]);
            $appointment['packages'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $appointments
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ VIEW APPOINTMENT DETAILS (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function show($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // ✅ SECURITY FIX: Check authorization BEFORE fetching appointment data
        // If CUSTOMER, include customer_id in WHERE clause to prevent unauthorized access
        if ($auth['role'] === 'CUSTOMER') {
            $stmt = $this->db->prepare("
                SELECT a.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
                FROM appointments a
                INNER JOIN customers c ON a.customer_id = c.customer_id
                WHERE a.appointment_id = ? AND a.salon_id = ? AND a.customer_id = ?
            ");
            $stmt->execute([$appointmentId, $salonId, $auth['customer_id']]);
        } else {
            // ADMIN/STAFF can view any appointment in their salon
            $stmt = $this->db->prepare("
                SELECT a.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
                FROM appointments a
                INNER JOIN customers c ON a.customer_id = c.customer_id
                WHERE a.appointment_id = ? AND a.salon_id = ?
            ");
            $stmt->execute([$appointmentId, $salonId]);
        }

        $appointment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        // Get services
        $stmt = $this->db->prepare("
            SELECT asvc.service_id, s.service_name, svc.staff_id, asvc.service_price,
                   asvc.discount_amount, asvc.final_price, asvc.start_time, asvc.end_time, asvc.status
            FROM appointment_services asvc
            INNER JOIN services s ON asvc.service_id = s.service_id
            INNER JOIN services svc ON asvc.service_id = svc.service_id
            WHERE asvc.appointment_id = ?
        ");
        $stmt->execute([$appointmentId]);
        $appointment['services'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get packages
        $stmt = $this->db->prepare("
            SELECT ap.package_id, p.package_name, ap.package_price,
                   ap.discount_amount, ap.final_price, ap.status
            FROM appointment_packages ap
            INNER JOIN packages p ON ap.package_id = p.package_id
            WHERE ap.appointment_id = ?
        ");
        $stmt->execute([$appointmentId]);
        $appointment['packages'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Check if feedback exists
        $stmt = $this->db->prepare("SELECT feedback_id FROM appointment_feedback WHERE appointment_id = ?");
        $stmt->execute([$appointmentId]);
        $appointment['feedback_given'] = (bool) $stmt->fetch();

        Response::json([
            "status" => "success",
            "data" => $appointment
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 6️⃣ SUBMIT FEEDBACK (CUSTOMER only)
    |--------------------------------------------------------------------------
    */
    public function submitFeedback($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify customer owns this appointment
        $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ? AND customer_id = ?");
        $stmt->execute([$appointmentId, $salonId, $auth['customer_id']]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        // Check if feedback already exists
        $stmt = $this->db->prepare("SELECT feedback_id FROM appointment_feedback WHERE appointment_id = ?");
        $stmt->execute([$appointmentId]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Feedback already submitted"], 409);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $rating = $data['rating'] ?? null;
        $comment = trim($data['comment'] ?? '');
        $isAnonymous = $data['is_anonymous'] ?? 0;

        // Validation
        if (!$rating || $rating < 1 || $rating > 5) {
            Response::json(["status" => "error", "message" => "Rating must be between 1 and 5"], 400);
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO appointment_feedback
                (appointment_id, customer_id, rating, comment, is_anonymous, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $appointmentId,
                $auth['customer_id'],
                $rating,
                $comment ?: null,
                $isAnonymous ? 1 : 0
            ]);

            Response::json([
                "status" => "success",
                "data" => [
                    "feedback_id" => $this->db->lastInsertId()
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to submit feedback: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 7️⃣ APPROVE APPOINTMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function approve($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ?");
        $stmt->execute([$appointmentId, $salonId]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        $stmt = $this->db->prepare("
            UPDATE appointments
            SET status = 'CONFIRMED', updated_at = NOW()
            WHERE appointment_id = ? AND salon_id = ?
        ");
        $stmt->execute([$appointmentId, $salonId]);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 8️⃣ COMPLETE APPOINTMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function complete($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $notes = trim($data['notes'] ?? '');

        $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ?");
        $stmt->execute([$appointmentId, $salonId]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        $stmt = $this->db->prepare("
            UPDATE appointments
            SET status = 'COMPLETED', notes = ?, updated_at = NOW()
            WHERE appointment_id = ? AND salon_id = ?
        ");
        $stmt->execute([$notes ?: $appointment['notes'], $appointmentId, $salonId]);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 9️⃣ ADD SERVICE TO APPOINTMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function addService($appointmentId, $serviceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // Verify appointment and service exist
        $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ?");
        $stmt->execute([$appointmentId, $salonId]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        $stmt = $this->db->prepare("SELECT * FROM services WHERE service_id = ? AND salon_id = ?");
        $stmt->execute([$serviceId, $salonId]);
        $service = $stmt->fetch();

        if (!$service) {
            Response::json(["status" => "error", "message" => "Service not found"], 404);
        }

        $price = $data['price'] ?? $service['price'];
        $discountAmount = $data['discount_amount'] ?? 0;
        $startTime = $data['start_time'] ?? null;
        $endTime = $data['end_time'] ?? null;
        $finalPrice = $price - $discountAmount;

        try {
            $stmt = $this->db->prepare("
                INSERT INTO appointment_services
                (appointment_id, service_id, service_price, discount_amount, final_price,
                 start_time, end_time, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())
            ");

            $stmt->execute([
                $appointmentId,
                $serviceId,
                $price,
                $discountAmount,
                $finalPrice,
                $startTime,
                $endTime
            ]);

            Response::json([
                "status" => "success",
                "data" => [
                    "appointment_service_id" => $this->db->lastInsertId()
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to add service: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 🔟 UPDATE APPOINTMENT SERVICE (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function updateService($appointmentId, $serviceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // Verify service exists in appointment
        $stmt = $this->db->prepare("SELECT * FROM appointment_services WHERE appointment_id = ? AND service_id = ?");
        $stmt->execute([$appointmentId, $serviceId]);
        $apptService = $stmt->fetch();

        if (!$apptService) {
            Response::json(["status" => "error", "message" => "Service not found in this appointment"], 404);
        }

        $allowedFields = ['service_price', 'discount_amount', 'start_time', 'end_time'];
        $updates = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($updates)) {
            Response::json(["status" => "error", "message" => "No valid fields to update"], 400);
        }

        // Recalculate final price
        $price = isset($data['service_price']) ? $data['service_price'] : $apptService['service_price'];
        $discount = isset($data['discount_amount']) ? $data['discount_amount'] : $apptService['discount_amount'];
        $finalPrice = $price - $discount;

        $updates[] = "final_price = ?";
        $values[] = $finalPrice;
        $updates[] = "updated_at = NOW()";
        $values[] = $appointmentId;
        $values[] = $serviceId;

        $sql = "UPDATE appointment_services SET " . implode(', ', $updates) . "
                WHERE appointment_id = ? AND service_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣0️⃣➁ REMOVE SERVICE FROM APPOINTMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function removeService($appointmentId, $serviceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify appointment exists and belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ?");
        $stmt->execute([$appointmentId, $salonId]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        // Verify service exists in this appointment
        $stmt = $this->db->prepare("SELECT * FROM appointment_services WHERE appointment_id = ? AND service_id = ?");
        $stmt->execute([$appointmentId, $serviceId]);
        $apptService = $stmt->fetch();

        if (!$apptService) {
            Response::json(["status" => "error", "message" => "Service not found in this appointment"], 404);
        }

        // Don't allow deletion if appointment is already completed
        if ($appointment['status'] === 'COMPLETED') {
            Response::json(["status" => "error", "message" => "Cannot remove service from completed appointment"], 400);
        }

        try {
            $this->db->beginTransaction();

            // Delete the service from appointment
            $stmt = $this->db->prepare("
                DELETE FROM appointment_services
                WHERE appointment_id = ? AND service_id = ?
            ");
            $stmt->execute([$appointmentId, $serviceId]);

            // Recalculate appointment total
            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(final_price), 0) AS new_total
                FROM appointment_services
                WHERE appointment_id = ?
            ");
            $stmt->execute([$appointmentId]);
            $servicesTotal = $stmt->fetchColumn();

            // Add packages total if any
            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(final_price), 0) AS packages_total
                FROM appointment_packages
                WHERE appointment_id = ?
            ");
            $stmt->execute([$appointmentId]);
            $packagesTotal = $stmt->fetchColumn();

            $newTotal = $servicesTotal + $packagesTotal;

            // Update appointment final_amount
            $stmt = $this->db->prepare("
                UPDATE appointments
                SET final_amount = ?, total_amount = ?, updated_at = NOW()
                WHERE appointment_id = ?
            ");
            $stmt->execute([$newTotal, $newTotal, $appointmentId]);

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "message" => "Service removed successfully",
                    "new_total" => $newTotal
                ]
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to remove service: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣1️⃣ ADD PACKAGE TO APPOINTMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function addPackage($appointmentId, $packageId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // Verify appointment exists
        $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ?");
        $stmt->execute([$appointmentId, $salonId]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        // Verify package exists and belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM packages WHERE package_id = ? AND salon_id = ?");
        $stmt->execute([$packageId, $salonId]);
        $package = $stmt->fetch();

        if (!$package) {
            Response::json(["status" => "error", "message" => "Package not found"], 404);
        }

        // Check if package already exists in this appointment
        $stmt = $this->db->prepare("SELECT * FROM appointment_packages WHERE appointment_id = ? AND package_id = ?");
        $stmt->execute([$appointmentId, $packageId]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Package already added to this appointment"], 409);
        }

        $price = $data['price'] ?? $package['total_price'];
        $discountAmount = $data['discount_amount'] ?? 0;
        $finalPrice = $price - $discountAmount;

        try {
            $stmt = $this->db->prepare("
                INSERT INTO appointment_packages
                (appointment_id, package_id, package_price, discount_amount, final_price,
                 status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())
            ");

            $stmt->execute([
                $appointmentId,
                $packageId,
                $price,
                $discountAmount,
                $finalPrice
            ]);

            $apptPackageId = $this->db->lastInsertId();

            // Recalculate appointment total
            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(final_price), 0) AS services_total
                FROM appointment_services
                WHERE appointment_id = ?
            ");
            $stmt->execute([$appointmentId]);
            $servicesTotal = $stmt->fetchColumn();

            $newTotal = $servicesTotal + $finalPrice;

            // Update appointment final_amount
            $stmt = $this->db->prepare("
                UPDATE appointments
                SET final_amount = ?, total_amount = ?, updated_at = NOW()
                WHERE appointment_id = ?
            ");
            $stmt->execute([$newTotal, $newTotal, $appointmentId]);

            Response::json([
                "status" => "success",
                "data" => [
                    "appointment_package_id" => $apptPackageId,
                    "package_id" => $packageId,
                    "final_price" => $finalPrice,
                    "new_total" => $newTotal
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to add package: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣2️⃣ UPDATE PACKAGE IN APPOINTMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function updatePackage($appointmentId, $packageId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // Verify package exists in appointment
        $stmt = $this->db->prepare("SELECT * FROM appointment_packages WHERE appointment_id = ? AND package_id = ?");
        $stmt->execute([$appointmentId, $packageId]);
        $apptPackage = $stmt->fetch();

        if (!$apptPackage) {
            Response::json(["status" => "error", "message" => "Package not found in this appointment"], 404);
        }

        $allowedFields = ['package_price', 'discount_amount'];
        $updates = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($updates)) {
            Response::json(["status" => "error", "message" => "No valid fields to update"], 400);
        }

        // Recalculate final price
        $price = isset($data['package_price']) ? $data['package_price'] : $apptPackage['package_price'];
        $discount = isset($data['discount_amount']) ? $data['discount_amount'] : $apptPackage['discount_amount'];
        $finalPrice = $price - $discount;

        $updates[] = "final_price = ?";
        $values[] = $finalPrice;
        $updates[] = "updated_at = NOW()";
        $values[] = $appointmentId;
        $values[] = $packageId;

        $sql = "UPDATE appointment_packages SET " . implode(', ', $updates) . "
                WHERE appointment_id = ? AND package_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        // Recalculate appointment total
        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(final_price), 0) AS services_total
            FROM appointment_services
            WHERE appointment_id = ?
        ");
        $stmt->execute([$appointmentId]);
        $servicesTotal = $stmt->fetchColumn();

        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(final_price), 0) AS packages_total
            FROM appointment_packages
            WHERE appointment_id = ?
        ");
        $stmt->execute([$appointmentId]);
        $packagesTotal = $stmt->fetchColumn();

        $newTotal = $servicesTotal + $packagesTotal;

        $stmt = $this->db->prepare("
            UPDATE appointments
            SET final_amount = ?, total_amount = ?, updated_at = NOW()
            WHERE appointment_id = ?
        ");
        $stmt->execute([$newTotal, $newTotal, $appointmentId]);

        Response::json([
            "status" => "success",
            "data" => [
                "new_total" => $newTotal
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣3️⃣ REMOVE PACKAGE FROM APPOINTMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function removePackage($appointmentId, $packageId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify appointment exists and belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ?");
        $stmt->execute([$appointmentId, $salonId]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        // Verify package exists in this appointment
        $stmt = $this->db->prepare("SELECT * FROM appointment_packages WHERE appointment_id = ? AND package_id = ?");
        $stmt->execute([$appointmentId, $packageId]);
        $apptPackage = $stmt->fetch();

        if (!$apptPackage) {
            Response::json(["status" => "error", "message" => "Package not found in this appointment"], 404);
        }

        // Don't allow deletion if appointment is already completed
        if ($appointment['status'] === 'COMPLETED') {
            Response::json(["status" => "error", "message" => "Cannot remove package from completed appointment"], 400);
        }

        try {
            $this->db->beginTransaction();

            // Delete the package from appointment
            $stmt = $this->db->prepare("
                DELETE FROM appointment_packages
                WHERE appointment_id = ? AND package_id = ?
            ");
            $stmt->execute([$appointmentId, $packageId]);

            // Recalculate appointment total
            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(final_price), 0) AS services_total
                FROM appointment_services
                WHERE appointment_id = ?
            ");
            $stmt->execute([$appointmentId]);
            $servicesTotal = $stmt->fetchColumn();

            $stmt = $this->db->prepare("
                SELECT COALESCE(SUM(final_price), 0) AS packages_total
                FROM appointment_packages
                WHERE appointment_id = ?
            ");
            $stmt->execute([$appointmentId]);
            $packagesTotal = $stmt->fetchColumn();

            $newTotal = $servicesTotal + $packagesTotal;

            // Update appointment final_amount
            $stmt = $this->db->prepare("
                UPDATE appointments
                SET final_amount = ?, total_amount = ?, updated_at = NOW()
                WHERE appointment_id = ?
            ");
            $stmt->execute([$newTotal, $newTotal, $appointmentId]);

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "message" => "Package removed successfully",
                    "new_total" => $newTotal
                ]
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to remove package: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣4️⃣ GENERATE INVOICE FROM APPOINTMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function generateInvoice($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // Verify appointment exists
        $stmt = $this->db->prepare("SELECT * FROM appointments WHERE appointment_id = ? AND salon_id = ?");
        $stmt->execute([$appointmentId, $salonId]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        // Check if invoice already exists
        $stmt = $this->db->prepare("SELECT invoice_customer_id FROM invoice_customer WHERE appointment_id = ?");
        $stmt->execute([$appointmentId]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Invoice already exists for this appointment"], 409);
        }

        $subtotalAmount = $data['subtotal_amount'] ?? $appointment['final_amount'];
        $taxAmount = $data['tax_amount'] ?? 0;
        $discountAmount = $data['discount_amount'] ?? 0;
        $dueDate = $data['due_date'] ?? date('Y-m-d', strtotime('+7 days'));
        $notes = trim($data['notes'] ?? '');
        $totalAmount = $subtotalAmount + $taxAmount - $discountAmount;

        // Generate invoice number
        $invoiceNumber = 'INV-C-' . $salonId . '-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

        try {
            $stmt = $this->db->prepare("
                INSERT INTO invoice_customer
                (appointment_id, salon_id, customer_id, invoice_number, subtotal_amount, tax_amount,
                 discount_amount, total_amount, payment_status, invoice_date, due_date, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', CURDATE(), ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $appointmentId,
                $salonId,
                $appointment['customer_id'],
                $invoiceNumber,
                $subtotalAmount,
                $taxAmount,
                $discountAmount,
                $totalAmount,
                $dueDate,
                $notes
            ]);

            Response::json([
                "status" => "success",
                "data" => [
                    "invoice_customer_id" => $this->db->lastInsertId(),
                    "invoice_number" => $invoiceNumber,
                    "total_amount" => $totalAmount,
                    "payment_status" => "UNPAID"
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to generate invoice: " . $e->getMessage()
            ], 500);
        }
    }
}

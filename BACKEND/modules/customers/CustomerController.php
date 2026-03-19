<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';


class CustomerController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }



    public function register()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $name       = trim($data['name'] ?? '');
        $phone      = trim($data['phone'] ?? '');
        $email      = trim($data['email'] ?? '');
        $password   = trim($data['password'] ?? '');
        $salon_id   = $data['salon_id'] ?? null;

        // 1️⃣ Basic Validation
        if (!$name || !$password || !$salon_id) {
            Response::json(["status" => "error", "message" => "Missing required fields"], 400);
            return;
        }

        // 2️⃣ Name Length Validation (1-100 characters)
        if (strlen($name) < 1 || strlen($name) > 100) {
            Response::json(["status" => "error", "message" => "Name must be between 1 and 100 characters"], 400);
            return;
        }

        // 3️⃣ Password Strength Validation (minimum 6 characters)
        if (strlen($password) < 6) {
            Response::json(["status" => "error", "message" => "Password must be at least 6 characters"], 400);
            return;
        }

        if (!$phone && !$email) {
            Response::json([
                "status" => "error",
                "message" => "Either phone or email is required"
            ], 400);
            return;
        }

        // 4️⃣ Email Format Validation (if provided)
        if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(["status" => "error", "message" => "Invalid email format"], 400);
            return;
        }

        // 5️⃣ Phone Format Validation (if provided) - 10-digit Indian format
        if ($phone && !preg_match("/^[6-9][0-9]{9}$/", $phone)) {
            Response::json(["status" => "error", "message" => "Invalid phone number (10-digit Indian format required)"], 400);
            return;
        }

        // 6️⃣ Check Salon Exists
        $stmt = $this->db->prepare("SELECT salon_id FROM salons WHERE salon_id = ?");
        $stmt->execute([$salon_id]);

        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Invalid salon"], 400);
            return;
        }

        // 7️⃣ Check Phone Uniqueness
        if ($phone) {
            $stmt = $this->db->prepare("
                SELECT customer_id FROM customers
                WHERE salon_id = ? AND phone = ?
            ");
            $stmt->execute([$salon_id, $phone]);

            if ($stmt->fetch()) {
                Response::json(["status" => "error", "message" => "Phone already registered"], 409);
                return;
            }
        }

        // 8️⃣ Check Email Uniqueness
        if ($email) {
            $stmt = $this->db->prepare("
                SELECT customer_id FROM customers
                WHERE salon_id = ? AND email = ?
            ");
            $stmt->execute([$salon_id, $email]);

            if ($stmt->fetch()) {
                Response::json(["status" => "error", "message" => "Email already registered"], 409);
                return;
            }
        }

        try {
            $this->db->beginTransaction();

            // 5️⃣ Insert into customers
            $stmt = $this->db->prepare("
                INSERT INTO customers 
                (salon_id, name, phone, email, customer_since, created_at, updated_at)
                VALUES (?, ?, ?, ?, CURDATE(), NOW(), NOW())
            ");

            $stmt->execute([
                $salon_id,
                $name,
                $phone ?: null,
                $email ?: null
            ]);

            $customer_id = $this->db->lastInsertId();

            // 6️⃣ Insert into authentication table
            $password_hash = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $this->db->prepare("
                INSERT INTO customer_authentication
                (customer_id, salon_id, email, password_hash, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
            ");

            $stmt->execute([
                $customer_id,
                $salon_id,
                $email ?: null,
                $password_hash
            ]);

            $this->db->commit();

            Response::json([
                "status" => "success",
                "message" => "Customer registered successfully"
            ], 201);

        // } catch (Exception $e) {

        //     $this->db->rollBack();

        //     Response::json([
        //         "status" => "error",
        //         "message" => "Registration failed"
        //     ], 500);
        // }

        } catch (Exception $e) {

    $this->db->rollBack();

    Response::json([
        "status" => "error",
        "message" => $e->getMessage()
    ], 500);
}
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE CUSTOMER (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function create()
    {
        $auth = $GLOBALS['auth_user'];
        $salonId = $auth['salon_id'];

        $data = json_decode(file_get_contents("php://input"), true);

        $name = trim($data['name'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $email = trim($data['email'] ?? '');
        $gender = $data['gender'] ?? null;
        $date_of_birth = $data['date_of_birth'] ?? null;
        $anniversary = $data['anniversary_date'] ?? null;

        // 1️⃣ Name Required
        if (!$name) {
            Response::json(["status" => "error", "message" => "Name is required"], 400);
        }

        // 2️⃣ Name Length Validation (1-100 characters)
        if (strlen($name) < 1 || strlen($name) > 100) {
            Response::json(["status" => "error", "message" => "Name must be between 1 and 100 characters"], 400);
        }

        // 3️⃣ Phone or Email Required
        if (!$phone && !$email) {
            Response::json(["status" => "error", "message" => "Phone or Email required"], 400);
        }

        // 4️⃣ Email Format Validation (if provided)
        if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(["status" => "error", "message" => "Invalid email format"], 400);
        }

        // 5️⃣ Phone Format Validation (if provided) - 10-digit Indian format
        if ($phone && !preg_match("/^[6-9][0-9]{9}$/", $phone)) {
            Response::json(["status" => "error", "message" => "Invalid phone number (10-digit Indian format required)"], 400);
        }

        // 6️⃣ Gender Enum Validation (if provided)
        $validGenders = ['MALE', 'FEMALE', 'OTHER', null];
        if ($gender && !in_array($gender, $validGenders)) {
            Response::json(["status" => "error", "message" => "Invalid gender value. Must be MALE, FEMALE, or OTHER"], 400);
        }

        // 7️⃣ Date Format Validation (if provided)
        if ($date_of_birth && !DateTime::createFromFormat('Y-m-d', $date_of_birth)) {
            Response::json(["status" => "error", "message" => "Invalid date of birth format (use YYYY-MM-DD)"], 400);
        }

        if ($anniversary && !DateTime::createFromFormat('Y-m-d', $anniversary)) {
            Response::json(["status" => "error", "message" => "Invalid anniversary date format (use YYYY-MM-DD)"], 400);
        }

        // Check uniqueness inside salon
        if ($phone) {
            $stmt = $this->db->prepare("SELECT customer_id FROM customers WHERE salon_id = ? AND phone = ?");
            $stmt->execute([$salonId, $phone]);
            if ($stmt->fetch()) {
                Response::json(["status" => "error", "message" => "Phone already exists"], 409);
            }
        }

        if ($email) {
            $stmt = $this->db->prepare("SELECT customer_id FROM customers WHERE salon_id = ? AND email = ?");
            $stmt->execute([$salonId, $email]);
            if ($stmt->fetch()) {
                Response::json(["status" => "error", "message" => "Email already exists"], 409);
            }
        }

        $stmt = $this->db->prepare("
            INSERT INTO customers 
            (salon_id, name, phone, email, gender, date_of_birth, anniversary_date, status, customer_since, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', CURDATE(), NOW(), NOW())
        ");

        $stmt->execute([
            $salonId,
            $name,
            $phone ?: null,
            $email ?: null,
            $gender,
            $date_of_birth,
            $anniversary
        ]);

        Response::json([
            "status" => "success",
            "data" => [
                "customer_id" => $this->db->lastInsertId()
            ]
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ UPDATE CUSTOMER (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function update($customerId)
    {
        $auth = $GLOBALS['auth_user'];
        $salonId = $auth['salon_id'];

        $data = json_decode(file_get_contents("php://input"), true);

        // Verify customer belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM customers WHERE customer_id = ? AND salon_id = ?");
        $stmt->execute([$customerId, $salonId]);
        $customer = $stmt->fetch();

        if (!$customer) {
            Response::json(["status" => "error", "message" => "Customer not found"], 404);
        }

        $allowedFields = [
            'name',
            'phone',
            'email',
            'gender',
            'date_of_birth',
            'anniversary_date',
            'address',
            'preferences',
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

        if (empty($updates)) {
            Response::json(["status" => "error", "message" => "No valid fields to update"], 400);
        }

        $values[] = $customerId;
        $values[] = $salonId;

        $sql = "UPDATE customers SET " . implode(', ', $updates) . ", updated_at = NOW() 
                WHERE customer_id = ? AND salon_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json(["status" => "success"]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ SOFT DELETE CUSTOMER
    |--------------------------------------------------------------------------
    */
    public function softDelete($customerId)
    {
        $auth = $GLOBALS['auth_user'];
        $salonId = $auth['salon_id'];

        $stmt = $this->db->prepare("
            UPDATE customers 
            SET status = 'INACTIVE', updated_at = NOW()
            WHERE customer_id = ? AND salon_id = ?
        ");

        $stmt->execute([$customerId, $salonId]);

        if ($stmt->rowCount() === 0) {
            Response::json(["status" => "error", "message" => "Customer not found"], 404);
        }

        Response::json(["status" => "success"]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ LIST CUSTOMERS (ADMIN, STAFF only)
    | NOTE: CUSTOMERs cannot list all customers - privacy protection
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'];
        $salonId = $auth['salon_id'];

        // SECURITY: CUSTOMERs cannot list all customers (privacy leak)
        if ($auth['role'] === 'CUSTOMER') {
            Response::json([
                "status" => "error",
                "message" => "Forbidden - Customers cannot list all customers"
            ], 403);
            return;
        }

        $countStmt = $this->db->prepare("
            SELECT COUNT(*) FROM customers
            WHERE salon_id = ? AND status = 'ACTIVE'
        ");
        $countStmt->execute([$salonId]);
        $total = $countStmt->fetchColumn();

        $stmt = $this->db->prepare("
            SELECT customer_id, name, phone, email
            FROM customers
            WHERE salon_id = ? AND status = 'ACTIVE'
            ORDER BY created_at DESC
        ");
        $stmt->execute([$salonId]);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $stmt->fetchAll(PDO::FETCH_ASSOC),
                "total" => (int)$total
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ VIEW CUSTOMER PROFILE
    |--------------------------------------------------------------------------
    */
    public function show($customerId)
    {
        $auth = $GLOBALS['auth_user'];
        $salonId = $auth['salon_id'];

        if ($auth['role'] === 'CUSTOMER') {
            if ($customerId != $auth['customer_id']) {
                Response::json(["status" => "error", "message" => "Forbidden"], 403);
            }
        }

        $stmt = $this->db->prepare("
            SELECT *
            FROM customers
            WHERE customer_id = ? AND salon_id = ?
        ");

        $stmt->execute([$customerId, $salonId]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$customer) {
            Response::json(["status" => "error", "message" => "Customer not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $customer
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 6️⃣ UPDATE OWN PROFILE (CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function updateMe()
    {
        $auth = $GLOBALS['auth_user'];
        $salonId = $auth['salon_id'];
        $customerId = $auth['customer_id'];

        $data = json_decode(file_get_contents("php://input"), true);

        $allowedFields = [
            'name',
            'phone',
            'email',
            'gender',
            'date_of_birth',
            'anniversary_date',
            'address',
            'preferences'
        ];

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

        $values[] = $customerId;
        $values[] = $salonId;

        $sql = "UPDATE customers SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE customer_id = ? AND salon_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json(["status" => "success"]);
    }

    /*
    |--------------------------------------------------------------------------
    | 7️⃣ GET OWN APPOINTMENTS (CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function getMyAppointments()
    {
        $auth = $GLOBALS['auth_user'];
        $customerId = $auth['customer_id'];
        $salonId = $auth['salon_id'];

        $status = $_GET['status'] ?? null;

        $sql = "
            SELECT a.appointment_id, a.salon_id, a.customer_id, a.appointment_date, a.start_time,
                   a.end_time, a.estimated_duration, a.total_amount, a.discount_amount, a.final_amount,
                   a.status, a.cancellation_reason, a.notes, a.created_at, a.updated_at
            FROM appointments a
            WHERE a.customer_id = ? AND a.salon_id = ?
        ";
        $params = [$customerId, $salonId];

        if ($status) {
            $sql .= " AND a.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY a.appointment_date DESC, a.start_time DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get services and packages for each appointment
        foreach ($appointments as &$appointment) {
            // Check if feedback exists
            $stmt = $this->db->prepare("SELECT feedback_id FROM appointment_feedback WHERE appointment_id = ?");
            $stmt->execute([$appointment['appointment_id']]);
            $appointment['feedback_given'] = (bool) $stmt->fetch();

            // Get services - staff_id inherited from services table
            $stmt = $this->db->prepare("
                SELECT asvc.service_id, s.service_name, svc.staff_id
                FROM appointment_services asvc
                INNER JOIN services s ON asvc.service_id = s.service_id
                INNER JOIN services svc ON asvc.service_id = svc.service_id
                WHERE asvc.appointment_id = ?
            ");
            $stmt->execute([$appointment['appointment_id']]);
            $appointment['services'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get packages - no staff_id (packages don't have staff, services do)
            $stmt = $this->db->prepare("
                SELECT ap.package_id, p.package_name
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
    | 8️⃣ GET CUSTOMER APPOINTMENTS (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function getAppointments($customerId)
    {
        $auth = $GLOBALS['auth_user'];
        $salonId = $auth['salon_id'];

        // If CUSTOMER, they can only view their own appointments
        if ($auth['role'] === 'CUSTOMER') {
            if ($customerId != $auth['customer_id']) {
                Response::json(["status" => "error", "message" => "Forbidden"], 403);
            }
        }

        $sql = "SELECT * FROM appointments WHERE customer_id = ? AND salon_id = ?";
        $params = [$customerId, $salonId];

        $sql .= " ORDER BY appointment_date DESC, start_time DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $appointments
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 9️⃣ GET OWN FEEDBACK (CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function getMyFeedback()
    {
        $auth = $GLOBALS['auth_user'];
        $customerId = $auth['customer_id'];

        $sql = "
            SELECT af.*, a.appointment_date
            FROM appointment_feedback af
            INNER JOIN appointments a ON af.appointment_id = a.appointment_id
            WHERE af.customer_id = ?
        ";
        $params = [$customerId];

        $sql .= " ORDER BY af.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $feedback = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $feedback
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 🔟 GET CUSTOMER FEEDBACK (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function getFeedback($customerId)
    {
        $auth = $GLOBALS['auth_user'];
        $salonId = $auth['salon_id'];

        // If CUSTOMER, they can only view their own feedback
        if ($auth['role'] === 'CUSTOMER') {
            if ($customerId != $auth['customer_id']) {
                Response::json(["status" => "error", "message" => "Forbidden"], 403);
            }
        }

        $sql = "
            SELECT af.*, a.appointment_date
            FROM appointment_feedback af
            INNER JOIN appointments a ON af.appointment_id = a.appointment_id
            INNER JOIN customers c ON af.customer_id = c.customer_id
            WHERE af.customer_id = ? AND c.salon_id = ?
        ";
        $params = [$customerId, $salonId];

        $sql .= " ORDER BY af.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $feedback = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $feedback
            ]
        ]);
    }
}

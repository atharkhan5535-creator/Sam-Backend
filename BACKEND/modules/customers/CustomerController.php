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

        if (!$phone && !$email) {
            Response::json([
                "status" => "error",
                "message" => "Either phone or email is required"
            ], 400);
            return;
        }

        // 2️⃣ Check Salon Exists
        $stmt = $this->db->prepare("SELECT salon_id FROM salons WHERE salon_id = ?");
        $stmt->execute([$salon_id]);

        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Invalid salon"], 400);
            return;
        }

        // 3️⃣ Check Phone Uniqueness
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

        // 4️⃣ Check Email Uniqueness
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

        if (!$name) {
            Response::json(["status" => "error", "message" => "Name is required"], 400);
        }

        if (!$phone && !$email) {
            Response::json(["status" => "error", "message" => "Phone or Email required"], 400);
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
    | 4️⃣ LIST CUSTOMERS
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'];
        $salonId = $auth['salon_id'];

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
            'name', 'phone', 'email',
            'date_of_birth', 'anniversary_date'
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
}


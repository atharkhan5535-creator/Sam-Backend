<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../helpers/PasswordHelper.php';

class UserController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE SALON ADMIN (SUPER_ADMIN only)
    | Creates an admin user for an existing salon
    |--------------------------------------------------------------------------
    */
    public function createSalonAdmin($salonId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? null;

        // Validation
        if (!$username || !$email) {
            Response::json(["status" => "error", "message" => "Username and email are required"], 400);
        }

        // Verify salon exists
        $stmt = $this->db->prepare("SELECT salon_id, salon_name FROM salons WHERE salon_id = ?");
        $stmt->execute([$salonId]);
        $salon = $stmt->fetch();

        if (!$salon) {
            Response::json(["status" => "error", "message" => "Salon not found"], 404);
        }

        // Check duplicate email in users table
        $stmt = $this->db->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Email already registered"], 409);
        }

        // Generate password if not provided
        $generateNewPassword = false;
        if (!$password) {
            $password = bin2hex(random_bytes(8)); // Generate 16-char random password
            $generateNewPassword = true;
        }

        if (strlen($password) < 6) {
            Response::json(["status" => "error", "message" => "Password must be at least 6 characters"], 400);
        }

        try {
            $passwordHash = PasswordHelper::hash($password);

            $stmt = $this->db->prepare("
                INSERT INTO users
                (salon_id, username, role, email, password_hash, status)
                VALUES (?, ?, 'ADMIN', ?, ?, 'ACTIVE')
            ");

            $stmt->execute([
                $salonId,
                $username,
                $email,
                $passwordHash
            ]);

            $userId = $this->db->lastInsertId();

            $responseData = [
                "user_id" => $userId,
                "role" => "ADMIN",
                "salon_id" => $salonId,
                "salon_name" => $salon['salon_name']
            ];

            // Include generated password in response only if it was auto-generated
            if ($generateNewPassword) {
                $responseData["generated_password"] = $password;
                $responseData["message"] = "Password auto-generated. Please share with admin securely.";
            }

            Response::json([
                "status" => "success",
                "data" => $responseData
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to create admin user: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ LIST USERS BY SALON (SUPER_ADMIN, ADMIN)
    | SUPER_ADMIN: Can view any salon's users
    | ADMIN: Can only view users in THEIR OWN salon
    |--------------------------------------------------------------------------
    */
    public function indexBySalon($salonId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;

        // Authorization check
        if (!$auth || !in_array($auth['role'], ['SUPER_ADMIN', 'ADMIN'])) {
            Response::json(["status" => "error", "message" => "Unauthorized"], 403);
        }

        // ADMIN can only access their own salon
        if ($auth['role'] === 'ADMIN' && $salonId != $auth['salon_id']) {
            Response::json(["status" => "error", "message" => "Forbidden - Can only access your own salon's users"], 403);
        }

        // Verify salon exists
        $stmt = $this->db->prepare("SELECT salon_id FROM salons WHERE salon_id = ?");
        $stmt->execute([$salonId]);
        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Salon not found"], 404);
        }

        $role = $_GET['role'] ?? null;
        $status = $_GET['status'] ?? null;

        $sql = "SELECT user_id, salon_id, username, role, email, status, created_at, updated_at
                FROM users WHERE salon_id = ?";
        $params = [$salonId];

        if ($role && in_array($role, ['ADMIN', 'STAFF'])) {
            $sql .= " AND role = ?";
            $params[] = $role;
        }

        if ($status && in_array($status, ['ACTIVE', 'INACTIVE', 'BLOCKED'])) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $users
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ VIEW USER DETAILS (SUPER_ADMIN, ADMIN)
    | SUPER_ADMIN: Can view ANY user across ALL salons
    | ADMIN: Can view ANY user within THEIR OWN salon
    | NOTE: Staff management is handled in StaffController
    |--------------------------------------------------------------------------
    */
    public function show($userId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;

        if (!$auth) {
            Response::json(["status" => "error", "message" => "Unauthenticated"], 401);
        }

        // ✅ SECURITY FIX: Check authorization BEFORE fetching user data
        // ADMIN can only view users within their own salon - check in SQL
        if ($auth['role'] === 'ADMIN') {
            $stmt = $this->db->prepare("
                SELECT user_id, salon_id, username, role, email, status, last_login, created_at, updated_at
                FROM users
                WHERE user_id = ? AND salon_id = ?
            ");
            $stmt->execute([$userId, $auth['salon_id']]);
        } else {
            // SUPER_ADMIN can view any user (no restrictions)
            $stmt = $this->db->prepare("
                SELECT user_id, salon_id, username, role, email, status, last_login, created_at, updated_at
                FROM users
                WHERE user_id = ?
            ");
            $stmt->execute([$userId]);
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            Response::json(["status" => "error", "message" => "User not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $user
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ UPDATE USER (SUPER_ADMIN, ADMIN)
    | SUPER_ADMIN: Can update ANY user across ALL salons
    | ADMIN: Can update ANY user within THEIR OWN salon (except status)
    |--------------------------------------------------------------------------
    */
    public function update($userId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;

        if (!$auth || !in_array($auth['role'], ['SUPER_ADMIN', 'ADMIN'])) {
            Response::json(["status" => "error", "message" => "Unauthorized"], 403);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // ✅ SECURITY FIX: Check authorization BEFORE fetching user data
        // ADMIN can only update users within their own salon - check in SQL
        if ($auth['role'] === 'ADMIN') {
            $stmt = $this->db->prepare("SELECT * FROM users WHERE user_id = ? AND salon_id = ?");
            $stmt->execute([$userId, $auth['salon_id']]);
        } else {
            // SUPER_ADMIN can update any user (no restrictions)
            $stmt = $this->db->prepare("SELECT * FROM users WHERE user_id = ?");
            $stmt->execute([$userId]);
        }

        $user = $stmt->fetch();

        if (!$user) {
            Response::json(["status" => "error", "message" => "User not found"], 404);
        }

        // ADMIN cannot update status (only SUPER_ADMIN can)
        $allowedFields = ['username', 'email', 'status'];
        if ($auth['role'] === 'ADMIN') {
            $allowedFields = ['username', 'email']; // ADMIN cannot change status
        }

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

        // Check duplicate email (exclude current user)
        if (isset($data['email']) && $data['email'] !== $user['email']) {
            $stmt = $this->db->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
            $stmt->execute([$data['email'], $userId]);
            if ($stmt->fetch()) {
                Response::json(["status" => "error", "message" => "Email already registered"], 409);
            }
        }

        $values[] = $userId;

        $sql = "UPDATE users SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE user_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ TOGGLE USER STATUS (SUPER_ADMIN only)
    | Sets user status to ACTIVE, INACTIVE, or BLOCKED
    |--------------------------------------------------------------------------
    */
    public function toggleStatus($userId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;

        // Check auth FIRST
        if (!$auth || $auth['role'] !== 'SUPER_ADMIN') {
            Response::json(["status" => "error", "message" => "Unauthorized - SUPER_ADMIN only"], 403);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $status = $data['status'] ?? null;

        // Verify user exists
        $stmt = $this->db->prepare("SELECT * FROM users WHERE user_id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::json(["status" => "error", "message" => "User not found"], 404);
        }

        // Validate status
        $validStatuses = ['ACTIVE', 'INACTIVE', 'BLOCKED'];
        if (!$status || !in_array($status, $validStatuses)) {
            Response::json(["status" => "error", "message" => "Status must be ACTIVE, INACTIVE, or BLOCKED"], 400);
        }

        // Prevent toggling self (SUPER_ADMIN)
        if ($auth && $auth['user_id'] == $userId) {
            Response::json(["status" => "error", "message" => "Cannot change your own status"], 400);
        }

        // Update user status
        $stmt = $this->db->prepare("
            UPDATE users
            SET status = ?, updated_at = NOW()
            WHERE user_id = ?
        ");
        $stmt->execute([$status, $userId]);

        Response::json([
            "status" => "success",
            "data" => [
                "user_id" => $userId,
                "status" => $status
            ]
        ]);
    }
}

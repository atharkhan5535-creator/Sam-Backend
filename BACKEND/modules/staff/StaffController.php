<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../helpers/PasswordHelper.php';

class StaffController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE STAFF (ADMIN only) - Creates users + staff_info
    |--------------------------------------------------------------------------
    */
    public function create()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? null;
        $role = $data['role'] ?? 'STAFF';
        $name = trim($data['name'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $status = $data['status'] ?? 'ACTIVE';
        $dateOfBirth = $data['date_of_birth'] ?? null;
        $dateOfJoining = $data['date_of_joining'] ?? null;
        $specialization = trim($data['specialization'] ?? '');
        $experienceYears = $data['experience_years'] ?? null;
        $salary = $data['salary'] ?? null;

        // 1️⃣ Required Fields Validation
        if (!$username || !$email || !$password || !$name) {
            Response::json(["status" => "error", "message" => "Username, email, password, and name are required"], 400);
        }

        // 2️⃣ Username Length Validation (3-50 characters)
        if (strlen($username) < 3 || strlen($username) > 50) {
            Response::json(["status" => "error", "message" => "Username must be between 3 and 50 characters"], 400);
        }

        // 3️⃣ Name Length Validation (1-100 characters)
        if (strlen($name) < 1 || strlen($name) > 100) {
            Response::json(["status" => "error", "message" => "Name must be between 1 and 100 characters"], 400);
        }

        // 4️⃣ Password Strength Validation (minimum 6 characters)
        if (strlen($password) < 6) {
            Response::json(["status" => "error", "message" => "Password must be at least 6 characters"], 400);
        }

        // 5️⃣ Role Enum Validation
        if (!in_array($role, ['ADMIN', 'STAFF'])) {
            Response::json(["status" => "error", "message" => "Role must be ADMIN or STAFF"], 400);
        }

        // 6️⃣ Email Format Validation
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(["status" => "error", "message" => "Invalid email format"], 400);
        }

        // 7️⃣ Phone Format Validation (if provided) - 10-digit Indian format
        if ($phone && !preg_match("/^[6-9][0-9]{9}$/", $phone)) {
            Response::json(["status" => "error", "message" => "Invalid phone number (10-digit Indian format required)"], 400);
        }

        // 8️⃣ Date Format Validation (if provided)
        if ($dateOfBirth && !DateTime::createFromFormat('Y-m-d', $dateOfBirth)) {
            Response::json(["status" => "error", "message" => "Invalid date of birth format (use YYYY-MM-DD)"], 400);
        }

        if ($dateOfJoining && !DateTime::createFromFormat('Y-m-d', $dateOfJoining)) {
            Response::json(["status" => "error", "message" => "Invalid date of joining format (use YYYY-MM-DD)"], 400);
        }

        // 9️⃣ Experience Years Range Validation (0-50 years)
        if ($experienceYears !== null && ($experienceYears < 0 || $experienceYears > 50)) {
            Response::json(["status" => "error", "message" => "Experience years must be between 0 and 50"], 400);
        }

        // 🔟 Salary Range Validation (must be >= 0)
        if ($salary !== null && $salary < 0) {
            Response::json(["status" => "error", "message" => "Salary must be greater than or equal to 0"], 400);
        }

        // Check email uniqueness in users table
        $stmt = $this->db->prepare("SELECT user_id FROM users WHERE salon_id = ? AND email = ?");
        $stmt->execute([$salonId, $email]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Email already exists"], 409);
        }

        // Check email uniqueness in staff_info
        $stmt = $this->db->prepare("SELECT staff_id FROM staff_info WHERE salon_id = ? AND email = ?");
        $stmt->execute([$salonId, $email]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Email already exists in staff records"], 409);
        }

        try {
            $this->db->beginTransaction();

            // Insert into users table
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $this->db->prepare("
                INSERT INTO users
                (salon_id, username, role, email, password_hash, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
            ");

            $stmt->execute([
                $salonId,
                $username,
                $role,
                $email,
                $passwordHash
            ]);

            $userId = $this->db->lastInsertId();

            // Insert into staff_info table
            $stmt = $this->db->prepare("
                INSERT INTO staff_info
                (salon_id, user_id, name, phone, email, date_of_birth, date_of_joining, specialization, experience_years, salary, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $salonId,
                $userId,
                $name,
                $phone ?: null,
                $email,
                $dateOfBirth ?: null,
                $dateOfJoining ?: null,
                $specialization ?: null,
                $experienceYears ?: null,
                $salary ?: null,
                $status
            ]);

            $staffId = $this->db->lastInsertId();

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "user_id" => $userId,
                    "staff_id" => $staffId
                ]
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to create staff: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ UPDATE STAFF DETAILS (ADMIN only) - Updates users + staff_info
    |--------------------------------------------------------------------------
    */
    public function update($staffId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify staff belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM staff_info WHERE staff_id = ? AND salon_id = ?");
        $stmt->execute([$staffId, $salonId]);
        $staff = $stmt->fetch();

        if (!$staff) {
            Response::json(["status" => "error", "message" => "Staff not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        try {
            $this->db->beginTransaction();

            // Update users table if email provided
            if (isset($data['email'])) {
                $email = trim($data['email']);
                
                // Check email uniqueness
                $checkStmt = $this->db->prepare("SELECT user_id FROM users WHERE salon_id = ? AND email = ? AND user_id != ?");
                $checkStmt->execute([$salonId, $email, $staff['user_id']]);
                if ($checkStmt->fetch()) {
                    Response::json(["status" => "error", "message" => "Email already exists"], 409);
                }

                $stmt = $this->db->prepare("
                    UPDATE users SET email = ?, updated_at = NOW()
                    WHERE user_id = ? AND salon_id = ?
                ");
                $stmt->execute([$email, $staff['user_id'], $salonId]);
            }

            // Update staff_info table
            $allowedFields = ['name', 'phone', 'email', 'date_of_birth', 'date_of_joining', 'specialization', 'experience_years', 'salary'];
            $updates = [];
            $values = [];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }

            if (!empty($updates)) {
                $values[] = $staffId;
                $values[] = $salonId;

                $sql = "UPDATE staff_info SET " . implode(', ', $updates) . ", updated_at = NOW()
                        WHERE staff_id = ? AND salon_id = ?";

                $stmt = $this->db->prepare($sql);
                $stmt->execute($values);
            }

            $this->db->commit();

            Response::json([
                "status" => "success"
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to update staff: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ ACTIVATE/DEACTIVATE STAFF (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function toggleStatus($staffId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $status = $data['status'] ?? null;

        $validStatuses = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'];
        if (!in_array($status, $validStatuses)) {
            Response::json(["status" => "error", "message" => "Invalid status value"], 400);
        }

        try {
            $this->db->beginTransaction();

            // Get user_id for this staff
            $stmt = $this->db->prepare("SELECT user_id FROM staff_info WHERE staff_id = ? AND salon_id = ?");
            $stmt->execute([$staffId, $salonId]);
            $staff = $stmt->fetch();

            if (!$staff) {
                Response::json(["status" => "error", "message" => "Staff not found"], 404);
            }

            // Update users table status
            $userStatus = ($status === 'ACTIVE') ? 'ACTIVE' : 'INACTIVE';
            $stmt = $this->db->prepare("
                UPDATE users SET status = ?, updated_at = NOW()
                WHERE user_id = ? AND salon_id = ?
            ");
            $stmt->execute([$userStatus, $staff['user_id'], $salonId]);

            // Update staff_info table status
            $stmt = $this->db->prepare("
                UPDATE staff_info SET status = ?, updated_at = NOW()
                WHERE staff_id = ? AND salon_id = ?
            ");
            $stmt->execute([$status, $staffId, $salonId]);

            $this->db->commit();

            Response::json([
                "status" => "success"
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to update status: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ LIST STAFF (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $status = $_GET['status'] ?? null;

        $sql = "
            SELECT si.staff_id, si.user_id, si.name, si.phone, si.email, 
                   si.specialization, si.status, si.date_of_joining,
                   u.role, u.last_login, si.created_at
            FROM staff_info si
            INNER JOIN users u ON si.user_id = u.user_id
            WHERE si.salon_id = ?
        ";

        $params = [$salonId];

        if ($status) {
            $sql .= " AND si.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY si.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $staff
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ VIEW STAFF DETAILS (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function show($staffId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT si.*, u.role, u.last_login
            FROM staff_info si
            INNER JOIN users u ON si.user_id = u.user_id
            WHERE si.staff_id = ? AND si.salon_id = ?
        ");

        $stmt->execute([$staffId, $salonId]);
        $staff = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$staff) {
            Response::json(["status" => "error", "message" => "Staff not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $staff
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 6️⃣ GENERATE STAFF INCENTIVE (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function createIncentive()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $staffId = $data['staff_id'] ?? null;
        $appointmentId = $data['appointment_id'] ?? null;
        $incentiveType = $data['incentive_type'] ?? null;
        $calculationType = $data['calculation_type'] ?? 'FIXED';
        $percentageRate = $data['percentage_rate'] ?? null;
        $fixedAmount = $data['fixed_amount'] ?? null;
        $baseAmount = $data['base_amount'] ?? null;
        $incentiveAmount = $data['incentive_amount'] ?? null;
        $remarks = trim($data['remarks'] ?? '');
        $status = $data['status'] ?? 'PENDING';

        // 1️⃣ Required Fields Validation
        if (!$staffId || !$incentiveType || !$incentiveAmount) {
            Response::json(["status" => "error", "message" => "Staff ID, incentive type, and amount are required"], 400);
        }

        // 2️⃣ Incentive Type Enum Validation
        $validTypes = ['SERVICE_COMMISSION', 'BONUS', 'TARGET_ACHIEVEMENT'];
        if (!in_array($incentiveType, $validTypes)) {
            Response::json(["status" => "error", "message" => "Invalid incentive type. Must be SERVICE_COMMISSION, BONUS, or TARGET_ACHIEVEMENT"], 400);
        }

        // 3️⃣ Incentive Amount Range Validation (must be > 0 and <= 1,000,000)
        if ($incentiveAmount <= 0 || $incentiveAmount > 1000000) {
            Response::json(["status" => "error", "message" => "Incentive amount must be between 0 and 1,000,000"], 400);
        }

        // 4️⃣ Status Enum Validation (includes APPROVED)
        $validStatuses = ['PENDING', 'APPROVED', 'PAID'];
        if (!in_array($status, $validStatuses)) {
            Response::json(["status" => "error", "message" => "Invalid status. Must be PENDING, APPROVED, or PAID"], 400);
        }

        // 5️⃣ Percentage Rate Range Validation (0-100)
        if ($percentageRate !== null && ($percentageRate < 0 || $percentageRate > 100)) {
            Response::json(["status" => "error", "message" => "Percentage rate must be between 0 and 100"], 400);
        }

        // 6️⃣ Fixed Amount Validation (must be >= 0)
        if ($fixedAmount !== null && $fixedAmount < 0) {
            Response::json(["status" => "error", "message" => "Fixed amount must be greater than or equal to 0"], 400);
        }

        // 7️⃣ Base Amount Validation (must be >= 0)
        if ($baseAmount !== null && $baseAmount < 0) {
            Response::json(["status" => "error", "message" => "Base amount must be greater than or equal to 0"], 400);
        }

        // Verify staff belongs to salon
        $stmt = $this->db->prepare("SELECT staff_id FROM staff_info WHERE staff_id = ? AND salon_id = ?");
        $stmt->execute([$staffId, $salonId]);
        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Staff not found"], 404);
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO incentives
                (staff_id, appointment_id, incentive_type, calculation_type, percentage_rate, fixed_amount, base_amount, incentive_amount, remarks, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $staffId,
                $appointmentId ?: null,
                $incentiveType,
                $calculationType,
                $percentageRate ?: null,
                $fixedAmount ?: null,
                $baseAmount ?: null,
                $incentiveAmount,
                $remarks ?: null,
                $status
            ]);

            Response::json([
                "status" => "success",
                "data" => [
                    "incentive_id" => $this->db->lastInsertId()
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to create incentive: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 7️⃣ INCENTIVE PAYOUT (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function createPayout($incentiveId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // ✅ Get staff_id from incentive (not from request body)
        $payoutAmount = $data['payout_amount'] ?? null;
        $payoutDate = $data['payout_date'] ?? date('Y-m-d');
        $paymentMode = $data['payment_mode'] ?? null;
        $transactionReference = trim($data['transaction_reference'] ?? '');
        $remarks = trim($data['remarks'] ?? '');

        // Validation
        if (!$payoutAmount || !$paymentMode) {
            Response::json(["status" => "error", "message" => "Payout amount and payment mode are required"], 400);
        }

        // Verify incentive exists and get staff_id from it
        $stmt = $this->db->prepare("
            SELECT incentive_id, staff_id, incentive_amount, status 
            FROM incentives 
            WHERE incentive_id = ?
        ");
        $stmt->execute([$incentiveId]);
        $incentive = $stmt->fetch();

        if (!$incentive) {
            Response::json(["status" => "error", "message" => "Incentive not found"], 404);
        }

        // Get staff_id from incentive (auto-filled, not from request)
        $staffId = $incentive['staff_id'];

        // Check if incentive is already paid
        if ($incentive['status'] === 'PAID') {
            Response::json(["status" => "error", "message" => "Incentive is already paid"], 400);
        }

        try {
            $this->db->beginTransaction();

            // Insert payout record
            $stmt = $this->db->prepare("
                INSERT INTO incentive_payouts
                (incentive_id, staff_id, payout_amount, payout_date, payment_mode, transaction_reference, remarks, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $incentiveId,
                $staffId,  // ← Auto-filled from incentive table
                $payoutAmount,
                $payoutDate,
                $paymentMode,
                $transactionReference ?: null,
                $remarks ?: null
            ]);

            $payoutId = $this->db->lastInsertId();

            // Update incentive status to PAID
            $stmt = $this->db->prepare("
                UPDATE incentives SET status = 'PAID', updated_at = NOW()
                WHERE incentive_id = ?
            ");
            $stmt->execute([$incentiveId]);

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "payout_id" => $payoutId
                ]
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to create payout: " . $e->getMessage()
            ], 500);
        }
    }
}

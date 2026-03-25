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
            Response::json(["status" => "error", "message" => "Incentive amount must be greater than 0 and not exceed 1,000,000"], 400);
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

    /*
    |--------------------------------------------------------------------------
    | 7️⃣BATCH INCENTIVE PAYOUT (ADMIN only)
    | Process multiple incentive payouts in a single transaction
    |--------------------------------------------------------------------------
    */
    public function createBatchPayout()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $staffId = $data['staff_id'] ?? null;
        $incentiveIds = $data['incentive_ids'] ?? [];
        $payoutDate = $data['payout_date'] ?? date('Y-m-d');
        $paymentMode = $data['payment_mode'] ?? null;
        $transactionReference = trim($data['transaction_reference'] ?? '');
        $remarks = trim($data['remarks'] ?? '');

        // Validation
        if (!$staffId) {
            Response::json(["status" => "error", "message" => "Staff ID is required"], 400);
        }

        if (empty($incentiveIds) || !is_array($incentiveIds)) {
            Response::json(["status" => "error", "message" => "At least one incentive ID is required"], 400);
        }

        if (!$paymentMode) {
            Response::json(["status" => "error", "message" => "Payment mode is required"], 400);
        }

        // Verify staff belongs to salon
        $stmt = $this->db->prepare("SELECT staff_id FROM staff_info WHERE staff_id = ? AND salon_id = ?");
        $stmt->execute([$staffId, $salonId]);
        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Staff not found in this salon"], 404);
        }

        try {
            $this->db->beginTransaction();

            $successCount = 0;
            $failCount = 0;
            $totalPaid = 0;
            $results = [];

            foreach ($incentiveIds as $incentiveId) {
                // Check if incentive exists and get its details
                // Added salon_id verification for security
                $stmt = $this->db->prepare("
                    SELECT i.incentive_id, i.staff_id, i.incentive_amount, i.status
                    FROM incentives i
                    INNER JOIN staff_info si ON i.staff_id = si.staff_id
                    WHERE i.incentive_id = ? AND i.staff_id = ? AND si.salon_id = ?
                ");
                $stmt->execute([$incentiveId, $staffId, $salonId]);
                $incentive = $stmt->fetch();

                if (!$incentive) {
                    $results[] = [
                        'incentive_id' => $incentiveId,
                        'success' => false,
                        'message' => 'Incentive not found'
                    ];
                    $failCount++;
                    continue;
                }

                // Check if already paid
                if ($incentive['status'] === 'PAID') {
                    $results[] = [
                        'incentive_id' => $incentiveId,
                        'success' => false,
                        'message' => 'Already paid'
                    ];
                    $failCount++;
                    continue;
                }

                // Insert payout record
                $stmt = $this->db->prepare("
                    INSERT INTO incentive_payouts
                    (incentive_id, staff_id, payout_amount, payout_date, payment_mode, transaction_reference, remarks, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ");

                $stmt->execute([
                    $incentiveId,
                    $staffId,
                    $incentive['incentive_amount'], // Use actual incentive amount
                    $payoutDate,
                    $paymentMode,
                    $transactionReference ?: null,
                    $remarks ?: null
                ]);

                // Update incentive status to PAID
                $stmt = $this->db->prepare("
                    UPDATE incentives SET status = 'PAID', updated_at = NOW()
                    WHERE incentive_id = ?
                ");
                $stmt->execute([$incentiveId]);

                $results[] = [
                    'incentive_id' => $incentiveId,
                    'success' => true,
                    'payout_amount' => $incentive['incentive_amount']
                ];
                $successCount++;
                $totalPaid += floatval($incentive['incentive_amount']);
            }

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "success_count" => $successCount,
                    "fail_count" => $failCount,
                    "total_paid" => $totalPaid,
                    "results" => $results
                ]
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to process batch payout: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 8️⃣ GET UNPAID INCENTIVES BY STAFF (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function getUnpaidIncentives($staffId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify staff exists and belongs to salon
        $stmt = $this->db->prepare("SELECT staff_id FROM staff_info WHERE staff_id = ? AND salon_id = ?");
        $stmt->execute([$staffId, $salonId]);
        $staff = $stmt->fetch();

        if (!$staff) {
            Response::json(["status" => "error", "message" => "Staff not found"], 404);
        }

        // Get all unpaid/pending incentives for this staff
        $stmt = $this->db->prepare("
            SELECT 
                i.incentive_id,
                i.incentive_type,
                i.calculation_type,
                i.incentive_amount,
                i.base_amount,
                i.percentage_rate,
                i.appointment_id,
                i.remarks,
                i.status,
                i.created_at,
                a.appointment_date,
                a.final_amount as appointment_amount
            FROM incentives i
            LEFT JOIN appointments a ON i.appointment_id = a.appointment_id
            WHERE i.staff_id = ? AND i.status != 'PAID'
            ORDER BY i.created_at DESC
        ");
        $stmt->execute([$staffId]);
        $incentives = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate total outstanding
        $totalOutstanding = array_sum(array_column($incentives, 'incentive_amount'));

        Response::json([
            "status" => "success",
            "data" => [
                "staff_id" => $staffId,
                "total_outstanding" => $totalOutstanding,
                "count" => count($incentives),
                "incentives" => $incentives
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 9️⃣ GET INCENTIVE HISTORY BY STAFF (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function getIncentiveHistory($staffId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify staff exists and belongs to salon
        $stmt = $this->db->prepare("SELECT staff_id FROM staff_info WHERE staff_id = ? AND salon_id = ?");
        $stmt->execute([$staffId, $salonId]);
        $staff = $stmt->fetch();

        if (!$staff) {
            Response::json(["status" => "error", "message" => "Staff not found"], 404);
        }

        // Get all incentives for this staff with payout info
        $stmt = $this->db->prepare("
            SELECT 
                i.*,
                a.appointment_date,
                a.final_amount as appointment_amount,
                p.payout_id,
                p.payout_amount,
                p.payout_date,
                p.payment_mode
            FROM incentives i
            LEFT JOIN appointments a ON i.appointment_id = a.appointment_id
            LEFT JOIN incentive_payouts p ON i.incentive_id = p.incentive_id
            WHERE i.staff_id = ?
            ORDER BY i.created_at DESC
        ");
        $stmt->execute([$staffId]);
        $incentives = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate totals
        $totalIncentives = array_sum(array_column($incentives, 'incentive_amount'));
        $totalPaid = array_sum(array_column($incentives, 'payout_amount'));

        Response::json([
            "status" => "success",
            "data" => [
                "staff_id" => $staffId,
                "total_incentives" => $totalIncentives,
                "total_paid" => $totalPaid,
                "total_outstanding" => $totalIncentives - $totalPaid,
                "count" => count($incentives),
                "incentives" => $incentives
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣0️⃣ GET ALL INCENTIVES (ADMIN only)
    | Returns list of all incentives with staff details
    |--------------------------------------------------------------------------
    */
    public function getAllIncentives()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;
        $staffId = $_GET['staff_id'] ?? null;
        $status = $_GET['status'] ?? null;
        $type = $_GET['type'] ?? null;

        // Build query with optional filters
        $query = "
            SELECT
                i.*,
                si.name as staff_name,
                si.specialization as staff_specialization,
                a.appointment_date,
                a.final_amount as appointment_amount
            FROM incentives i
            INNER JOIN staff_info si ON i.staff_id = si.staff_id
            LEFT JOIN appointments a ON i.appointment_id = a.appointment_id
            WHERE si.salon_id = ?
        ";

        $params = [$salonId];

        if ($startDate) {
            $query .= " AND i.created_at >= ?";
            $params[] = $startDate;
        }

        if ($endDate) {
            $query .= " AND i.created_at <= ?";
            $params[] = $endDate;
        }

        if ($staffId) {
            $query .= " AND i.staff_id = ?";
            $params[] = $staffId;
        }

        if ($status) {
            $query .= " AND i.status = ?";
            $params[] = $status;
        }

        if ($type) {
            $query .= " AND i.incentive_type = ?";
            $params[] = $type;
        }

        $query .= " ORDER BY i.created_at DESC";

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $incentives = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $incentives,
                "total" => count($incentives)
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 🔟 PUBLIC STAFF LIST (For Customer Booking)
    | - PUBLIC: Can view active staff members (for booking)
    | - Returns only ACTIVE staff with essential info
    |--------------------------------------------------------------------------
    */
    public function publicList()
    {
        // Get salon_id from query parameter (public access)
        $salonId = $_GET['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Salon ID required (pass as query parameter ?salon_id=X)"], 400);
        }

        // Get only ACTIVE staff members with essential info for booking
        $stmt = $this->db->prepare("
            SELECT
                s.staff_id,
                s.salon_id,
                s.name,
                s.phone,
                s.email,
                s.specialization,
                s.experience_years,
                s.status
            FROM staff_info s
            WHERE s.salon_id = ? AND s.status = 'ACTIVE'
            ORDER BY s.name ASC
        ");
        $stmt->execute([$salonId]);
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
    | 1️⃣1️⃣ GET APPOINTMENT COMMISSION BREAKDOWN
    | - Calculate staff commissions from appointment services and packages
    | - Extract staff IDs from services and packages within the appointment
    | - Return detailed breakdown per staff member
    |--------------------------------------------------------------------------
    */
    public function getAppointmentCommissionBreakdown($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        try {
            // Verify appointment exists and belongs to salon
            $stmt = $this->db->prepare("
                SELECT
                    a.appointment_id,
                    a.customer_id,
                    a.appointment_date,
                    a.start_time,
                    a.end_time,
                    a.total_amount,
                    a.discount_amount,
                    a.final_amount,
                    a.status,
                    c.name as customer_name,
                    c.phone as customer_phone
                FROM appointments a
                INNER JOIN customers c ON a.customer_id = c.customer_id
                WHERE a.appointment_id = ? AND a.salon_id = ?
            ");
            $stmt->execute([$appointmentId, $salonId]);
            $appointment = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$appointment) {
                Response::json(["status" => "error", "message" => "Appointment not found"], 404);
            }

            // Get services with staff assignments
            // Note: appointment_services.staff_id was removed, get staff from services table
            $stmt = $this->db->prepare("
                SELECT
                    aserv.appointment_service_id,
                    aserv.service_id,
                    s.staff_id,
                    aserv.service_price,
                    aserv.discount_amount,
                    aserv.final_price,
                    aserv.status as service_status,
                    s.service_name,
                    si.name as staff_name,
                    si.specialization as staff_specialization
                FROM appointment_services aserv
                INNER JOIN services s ON aserv.service_id = s.service_id
                INNER JOIN staff_info si ON s.staff_id = si.staff_id
                WHERE aserv.appointment_id = ?
            ");
            $stmt->execute([$appointmentId]);
            $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get packages with staff assignments (from package_services)
            // Note: package_services only has package_id, service_id, salon_id
            // Get service_price from services table (column is 'price' not 'service_price')
            $stmt = $this->db->prepare("
                SELECT
                    ap.appointment_package_id,
                    ap.package_id,
                    ap.package_price,
                    ap.discount_amount,
                    ap.final_price,
                    ap.status as package_status,
                    p.package_name,
                    ps.service_id,
                    s.staff_id,
                    s.price as service_price,
                    s.service_name,
                    si.name as staff_name,
                    si.specialization as staff_specialization
                FROM appointment_packages ap
                INNER JOIN packages p ON ap.package_id = p.package_id
                INNER JOIN package_services ps ON ap.package_id = ps.package_id
                INNER JOIN services s ON ps.service_id = s.service_id
                INNER JOIN staff_info si ON s.staff_id = si.staff_id
                WHERE ap.appointment_id = ?
            ");
            $stmt->execute([$appointmentId]);
            $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calculate commission per staff member
            $staffCommissions = [];

            // Process services
            foreach ($services as $service) {
                $staffId = $service['staff_id'];
                
                if (!isset($staffCommissions[$staffId])) {
                    $staffCommissions[$staffId] = [
                        'staff_id' => $staffId,
                        'staff_name' => $service['staff_name'],
                        'staff_specialization' => $service['staff_specialization'],
                        'services' => [],
                        'package_services' => [],
                        'total_amount' => 0,
                        'commission_amount' => 0
                    ];
                }

                // Default commission rate: 10% of service final price
                $commissionRate = 0.10;
                $commissionAmount = $service['final_price'] * $commissionRate;

                $staffCommissions[$staffId]['services'][] = [
                    'service_id' => $service['service_id'],
                    'service_name' => $service['service_name'],
                    'price' => (float)$service['service_price'],
                    'discount' => (float)$service['discount_amount'],
                    'final_price' => (float)$service['final_price'],
                    'status' => $service['service_status'],
                    'commission_rate' => $commissionRate * 100,
                    'commission_amount' => $commissionAmount
                ];

                $staffCommissions[$staffId]['total_amount'] += (float)$service['final_price'];
                $staffCommissions[$staffId]['commission_amount'] += $commissionAmount;
            }

            // Process packages - distribute package revenue among staff
            foreach ($packages as $package) {
                $staffId = $package['staff_id'];
                
                if (!isset($staffCommissions[$staffId])) {
                    $staffCommissions[$staffId] = [
                        'staff_id' => $staffId,
                        'staff_name' => $package['staff_name'],
                        'staff_specialization' => $package['staff_specialization'],
                        'services' => [],
                        'package_services' => [],
                        'total_amount' => 0,
                        'commission_amount' => 0
                    ];
                }

                // Calculate proportional share of package price
                $totalPackageServices = count($packages);
                $proportionalShare = $package['final_price'] / max($totalPackageServices, 1);
                
                // Default commission rate: 10% of proportional package price
                $commissionRate = 0.10;
                $commissionAmount = $proportionalShare * $commissionRate;

                $staffCommissions[$staffId]['package_services'][] = [
                    'package_id' => $package['package_id'],
                    'package_name' => $package['package_name'],
                    'service_id' => $package['service_id'],
                    'service_name' => $package['service_name'],
                    'proportional_share' => $proportionalShare,
                    'commission_rate' => $commissionRate * 100,
                    'commission_amount' => $commissionAmount
                ];

                $staffCommissions[$staffId]['total_amount'] += $proportionalShare;
                $staffCommissions[$staffId]['commission_amount'] += $commissionAmount;
            }

            // Re-index array
            $staffCommissions = array_values($staffCommissions);

            // Calculate totals
            $totalAmount = array_sum(array_column($staffCommissions, 'total_amount'));
            $totalCommission = array_sum(array_column($staffCommissions, 'commission_amount'));

            Response::json([
                "status" => "success",
                "data" => [
                    "appointment" => $appointment,
                    "staff_commissions" => $staffCommissions,
                    "summary" => [
                        "total_services" => count($services),
                        "total_package_services" => count($packages),
                        "total_amount" => $totalAmount,
                        "total_commission" => $totalCommission,
                        "staff_count" => count($staffCommissions)
                    ]
                ]
            ]);
            
        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to get commission breakdown: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣2️⃣ CREATE INCENTIVE FROM APPOINTMENT COMMISSION
    | - Create incentives for all staff members from an appointment
    | - Automatically calculate commissions based on services performed
    |--------------------------------------------------------------------------
    */
    public function createIncentiveFromAppointment($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $commissionRate = floatval($data['commission_rate'] ?? 10); // Default 10%
        $remarks = trim($data['remarks'] ?? 'Commission from appointment #' . $appointmentId);
        $status = $data['status'] ?? 'PENDING';

        try {
            $this->db->beginTransaction();

            // Get appointment details
            $stmt = $this->db->prepare("
                SELECT 
                    a.appointment_id,
                    a.final_amount,
                    a.appointment_date,
                    c.name as customer_name
                FROM appointments a
                INNER JOIN customers c ON a.customer_id = c.customer_id
                WHERE a.appointment_id = ? AND a.salon_id = ?
            ");
            $stmt->execute([$appointmentId, $salonId]);
            $appointment = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$appointment) {
                $this->db->rollBack();
                Response::json(["status" => "error", "message" => "Appointment not found"], 404);
            }

            // Get services with staff
            // Note: appointment_services.staff_id was removed, get staff from services table
            $stmt = $this->db->prepare("
                SELECT
                    s.staff_id,
                    aserv.final_price,
                    s.service_name,
                    si.name as staff_name
                FROM appointment_services aserv
                INNER JOIN services s ON aserv.service_id = s.service_id
                INNER JOIN staff_info si ON s.staff_id = si.staff_id
                WHERE aserv.appointment_id = ?
            ");
            $stmt->execute([$appointmentId]);
            $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get package services with staff
            // Note: package_services only has package_id, service_id, salon_id
            // Get price from services table (column is 'price' not 'service_price')
            $stmt = $this->db->prepare("
                SELECT
                    s.staff_id,
                    s.price as service_price,
                    p.package_name,
                    s.service_name,
                    si.name as staff_name
                FROM appointment_packages ap
                INNER JOIN packages p ON ap.package_id = p.package_id
                INNER JOIN package_services ps ON ap.package_id = ps.package_id
                INNER JOIN services s ON ps.service_id = s.service_id
                INNER JOIN staff_info si ON s.staff_id = si.staff_id
                WHERE ap.appointment_id = ?
            ");
            $stmt->execute([$appointmentId]);
            $packageServices = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $createdIncentives = [];
            $totalIncentives = 0;

            // Process services - group by staff
            $staffServices = [];
            foreach ($services as $service) {
                $staffId = $service['staff_id'];
                if (!isset($staffServices[$staffId])) {
                    $staffServices[$staffId] = [
                        'staff_name' => $service['staff_name'],
                        'total_amount' => 0,
                        'services' => []
                    ];
                }
                $staffServices[$staffId]['total_amount'] += (float)$service['final_price'];
                $staffServices[$staffId]['services'][] = $service['service_name'];
            }

            // Process package services - group by staff
            $staffPackages = [];
            $totalPackageServices = count($packageServices);
            foreach ($packageServices as $ps) {
                $staffId = $ps['staff_id'];
                if (!isset($staffPackages[$staffId])) {
                    $staffPackages[$staffId] = [
                        'staff_name' => $ps['staff_name'],
                        'total_amount' => 0,
                        'services' => []
                    ];
                }
                // Proportional share of package
                $proportionalShare = (float)$appointment['final_amount'] / max($totalPackageServices, 1);
                $staffPackages[$staffId]['total_amount'] += $proportionalShare;
                $staffPackages[$staffId]['services'][] = $ps['service_name'] . ' (' . $ps['package_name'] . ')';
            }

            // Merge staff data
            $allStaff = array_unique(array_merge(array_keys($staffServices), array_keys($staffPackages)));

            foreach ($allStaff as $staffId) {
                $totalAmount = 0;
                $serviceList = [];

                if (isset($staffServices[$staffId])) {
                    $totalAmount += $staffServices[$staffId]['total_amount'];
                    $serviceList = array_merge($serviceList, $staffServices[$staffId]['services']);
                }

                if (isset($staffPackages[$staffId])) {
                    $totalAmount += $staffPackages[$staffId]['total_amount'];
                    $serviceList = array_merge($serviceList, $staffPackages[$staffId]['services']);
                }

                if ($totalAmount > 0) {
                    $commissionAmount = $totalAmount * ($commissionRate / 100);
                    $serviceNames = implode(', ', array_unique($serviceList));
                    $fullRemarks = $remarks . ' - Services: ' . $serviceNames;

                    // Check if incentive already exists for this staff & appointment
                    $stmt = $this->db->prepare("
                        SELECT incentive_id FROM incentives 
                        WHERE staff_id = ? AND appointment_id = ?
                    ");
                    $stmt->execute([$staffId, $appointmentId]);
                    
                    if ($stmt->fetch()) {
                        $createdIncentives[] = [
                            'staff_id' => $staffId,
                            'status' => 'skipped',
                            'message' => 'Incentive already exists'
                        ];
                        continue;
                    }

                    // Create incentive
                    $stmt = $this->db->prepare("
                        INSERT INTO incentives (
                            staff_id,
                            appointment_id,
                            incentive_type,
                            calculation_type,
                            base_amount,
                            percentage_rate,
                            incentive_amount,
                            remarks,
                            status,
                            created_at,
                            updated_at
                        ) VALUES (?, ?, 'SERVICE_COMMISSION', 'PERCENTAGE', ?, ?, ?, ?, ?, NOW(), NOW())
                    ");
                    
                    $stmt->execute([
                        $staffId,
                        $appointmentId,
                        $totalAmount,
                        $commissionRate,
                        $commissionAmount,
                        $fullRemarks,
                        $status
                    ]);

                    $createdIncentives[] = [
                        'incentive_id' => $this->db->lastInsertId(),
                        'staff_id' => $staffId,
                        'staff_name' => $staffServices[$staffId]['staff_name'] ?? $staffPackages[$staffId]['staff_name'],
                        'base_amount' => $totalAmount,
                        'commission_rate' => $commissionRate,
                        'commission_amount' => $commissionAmount,
                        'status' => 'created'
                    ];

                    $totalIncentives += $commissionAmount;
                }
            }

            $this->db->commit();

            Response::json([
                "status" => "success",
                "message" => "Incentives created successfully",
                "data" => [
                    "appointment_id" => $appointmentId,
                    "appointment_date" => $appointment['appointment_date'],
                    "customer_name" => $appointment['customer_name'],
                    "commission_rate" => $commissionRate,
                    "total_incentives" => $totalIncentives,
                    "incentives_created" => count(array_filter($createdIncentives, fn($i) => $i['status'] === 'created')),
                    "incentives" => $createdIncentives
                ]
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to create incentives: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣3️⃣ GET COMPLETABLE APPOINTMENTS FOR INCENTIVES
    | - Get appointments that haven't had incentives created yet
    | - Filter by COMPLETED status
    |--------------------------------------------------------------------------
    */
    public function getCompletableAppointments()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        // Note: appointment_services.staff_id was removed in migration
        // We get staff from services table instead
        $query = "
            SELECT
                a.appointment_id,
                a.appointment_date,
                a.start_time,
                a.end_time,
                a.total_amount,
                a.discount_amount,
                a.final_amount,
                a.status,
                c.name as customer_name,
                c.phone as customer_phone,
                COUNT(DISTINCT aserv.appointment_service_id) as service_count,
                COUNT(DISTINCT ap.appointment_package_id) as package_count,
                GROUP_CONCAT(DISTINCT si.name SEPARATOR ', ') as staff_names
            FROM appointments a
            INNER JOIN customers c ON a.customer_id = c.customer_id
            LEFT JOIN appointment_services aserv ON a.appointment_id = aserv.appointment_id
            LEFT JOIN services s ON aserv.service_id = s.service_id
            LEFT JOIN staff_info si ON s.staff_id = si.staff_id
            LEFT JOIN appointment_packages ap ON a.appointment_id = ap.appointment_id
            WHERE a.salon_id = ? AND a.status = 'COMPLETED'
        ";

        $params = [$salonId];

        if ($startDate) {
            $query .= " AND a.appointment_date >= ?";
            $params[] = $startDate;
        }

        if ($endDate) {
            $query .= " AND a.appointment_date <= ?";
            $params[] = $endDate;
        }

        $query .= "
            GROUP BY a.appointment_id
            ORDER BY a.appointment_date DESC, a.start_time DESC
        ";

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Check which appointments already have incentives
        foreach ($appointments as &$appt) {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as incentive_count
                FROM incentives
                WHERE appointment_id = ?
            ");
            $stmt->execute([$appt['appointment_id']]);
            $result = $stmt->fetch();
            $appt['has_incentives'] = $result['incentive_count'] > 0;
            $appt['existing_incentive_count'] = $result['incentive_count'];
        }

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $appointments,
                "total" => count($appointments)
            ]
        ]);
    }
}

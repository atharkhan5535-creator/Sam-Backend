<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class SubscriptionPlanController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATION HELPER
    |--------------------------------------------------------------------------
    */
    private function validatePlanData($data, $isUpdate = false)
    {
        if ($isUpdate && (!isset($data['plan_id']) || !is_numeric($data['plan_id']))) {
            return "Valid plan_id is required";
        }

        if (!isset($data['plan_name']) || trim($data['plan_name']) === '') {
            return "Plan name is required";
        }

        if (!isset($data['duration_days']) || !is_numeric($data['duration_days']) || $data['duration_days'] <= 0) {
            return "Duration must be greater than 0";
        }

        $allowedTypes = ['flat', 'per-appointments', 'Percentage-per-appointments'];
        if (!isset($data['plan_type']) || !in_array($data['plan_type'], $allowedTypes)) {
            return "Invalid plan type";
        }

        if (!isset($data['flat_price']) || !is_numeric($data['flat_price']) || $data['flat_price'] < 0) {
            return "Invalid flat price";
        }

        if (isset($data['per_appointments_price']) && (!is_numeric($data['per_appointments_price']) || $data['per_appointments_price'] < 0)) {
            return "Invalid per appointment price";
        }

        if (isset($data['percentage_per_appointments']) && (!is_numeric($data['percentage_per_appointments']) || $data['percentage_per_appointments'] < 0)) {
            return "Invalid percentage";
        }

        if (isset($data['status']) && !in_array($data['status'], [0, 1])) {
            return "Status must be 0 or 1";
        }

        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE SUBSCRIPTION PLAN (SUPER_ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Validation using helper
        $error = $this->validatePlanData($data);
        if ($error) {
            Response::json(["status" => "error", "message" => $error], 400);
        }

        $planName = trim($data['plan_name']);
        $durationDays = (int) $data['duration_days'];
        $status = $data['status'] ?? 1;
        $planType = $data['plan_type'];
        $flatPrice = (float) $data['flat_price'];
        $perAppointmentsPrice = isset($data['per_appointments_price']) ? (float) $data['per_appointments_price'] : null;
        $percentagePerAppointments = isset($data['percentage_per_appointments']) ? (float) $data['percentage_per_appointments'] : null;

        try {
            $stmt = $this->db->prepare("
                INSERT INTO subscription_plans
                (plan_name, duration_days, status, plan_type, flat_price, per_appointments_price, percentage_per_appointments)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $planName,
                $durationDays,
                $status,
                $planType,
                $flatPrice,
                $perAppointmentsPrice,
                $percentagePerAppointments
            ]);

            Response::json([
                "status" => "success",
                "data" => [
                    "plan_id" => $this->db->lastInsertId()
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to create subscription plan: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ UPDATE SUBSCRIPTION PLAN
    |--------------------------------------------------------------------------
    */
    public function update($planId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Add plan_id to data for validation
        $data['plan_id'] = $planId;

        // Verify plan exists
        $stmt = $this->db->prepare("SELECT * FROM subscription_plans WHERE plan_id = ?");
        $stmt->execute([$planId]);
        $plan = $stmt->fetch();

        if (!$plan) {
            Response::json(["status" => "error", "message" => "Plan not found"], 404);
        }

        // Validation using helper
        $error = $this->validatePlanData($data, true);
        if ($error) {
            Response::json(["status" => "error", "message" => $error], 400);
        }

        $allowedFields = ['plan_name', 'duration_days', 'status', 'plan_type', 'flat_price',
                          'per_appointments_price', 'percentage_per_appointments'];
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

        $values[] = $planId;

        $sql = "UPDATE subscription_plans SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE plan_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ LIST SUBSCRIPTION PLANS
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $status = $_GET['status'] ?? null;

        $sql = "SELECT * FROM subscription_plans WHERE 1=1";
        $params = [];

        if ($status !== null) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $plans
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ VIEW SUBSCRIPTION PLAN DETAILS
    |--------------------------------------------------------------------------
    */
    public function show($planId)
    {
        $stmt = $this->db->prepare("SELECT * FROM subscription_plans WHERE plan_id = ?");
        $stmt->execute([$planId]);
        $plan = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$plan) {
            Response::json(["status" => "error", "message" => "Plan not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $plan
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ TOGGLE PLAN STATUS
    |--------------------------------------------------------------------------
    */
    public function toggleStatus($planId)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $status = $data['status'] ?? null;

        if ($status === null || !in_array($status, [0, 1])) {
            Response::json(["status" => "error", "message" => "Status must be 0 or 1"], 400);
        }

        $stmt = $this->db->prepare("
            UPDATE subscription_plans
            SET status = ?, updated_at = NOW()
            WHERE plan_id = ?
        ");

        $stmt->execute([$status, $planId]);

        if ($stmt->rowCount() === 0) {
            Response::json(["status" => "error", "message" => "Plan not found"], 404);
        }

        Response::json([
            "status" => "success"
        ]);
    }
}

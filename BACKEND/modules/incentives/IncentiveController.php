<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class IncentiveController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ GET MONTHLY INCENTIVES (ADMIN only)
    | - Returns overall total at top
    | - Returns staff-wise breakdown
    |--------------------------------------------------------------------------
    */
    public function getMonthlyIncentives()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Get month from query param (default: current month)
        $month = $_GET['month'] ?? date('Y-m');
        $staffId = $_GET['staff_id'] ?? null;

        try {
            // 1. Get OVERALL TOTAL for the month
            $overallQuery = "
                SELECT
                    COALESCE(SUM(CASE WHEN i.status IN ('APPROVED', 'PAID') THEN i.incentive_amount ELSE 0 END), 0) as total_earned,
                    COALESCE(SUM(CASE WHEN i.status = 'PAID' THEN i.incentive_amount ELSE 0 END), 0) as total_paid,
                    COALESCE(SUM(CASE WHEN i.status IN ('APPROVED', 'PENDING') THEN i.incentive_amount ELSE 0 END), 0) as total_outstanding
                FROM incentives i
                JOIN staff_info si ON i.staff_id = si.staff_id
                WHERE si.salon_id = ?
                AND DATE_FORMAT(i.created_at, '%Y-%m') = ?
            ";

            $stmt = $this->db->prepare($overallQuery);
            $stmt->execute([$salonId, $month]);
            $overall = $stmt->fetch(PDO::FETCH_ASSOC);

            // 2. Get STAFF-WISE BREAKDOWN
            $staffQuery = "
                SELECT
                    si.staff_id,
                    si.name,
                    si.specialization,
                    COUNT(i.incentive_id) as total_count,
                    COALESCE(SUM(CASE WHEN i.status IN ('APPROVED', 'PAID') THEN i.incentive_amount ELSE 0 END), 0) as total_earned,
                    COALESCE(SUM(CASE WHEN i.status = 'PAID' THEN i.incentive_amount ELSE 0 END), 0) as total_paid,
                    COALESCE(SUM(CASE WHEN i.status IN ('APPROVED', 'PENDING') THEN i.incentive_amount ELSE 0 END), 0) as outstanding
                FROM staff_info si
                LEFT JOIN incentives i ON si.staff_id = i.staff_id
                    AND DATE_FORMAT(i.created_at, '%Y-%m') = ?
                WHERE si.salon_id = ?
                AND si.status = 'ACTIVE'
                " . ($staffId ? "AND si.staff_id = ?" : "") . "
                GROUP BY si.staff_id, si.name, si.specialization
                HAVING total_earned > 0 OR total_paid > 0
                ORDER BY total_earned DESC
            ";

            $stmt = $this->db->prepare($staffQuery);
            if ($staffId) {
                $stmt->execute([$month, $salonId, $staffId]);
            } else {
                $stmt->execute([$month, $salonId]);
            }
            $staffBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 3. Get INDIVIDUAL INCENTIVES per staff (for payout modal)
            $incentivesByStaff = [];
            foreach ($staffBreakdown as $staff) {
                $detailQuery = "
                    SELECT
                        i.incentive_id,
                        i.type,
                        i.calculation_type,
                        i.incentive_amount,
                        i.status,
                        i.remarks,
                        i.created_at,
                        a.appointment_id
                    FROM incentives i
                    LEFT JOIN appointments a ON i.appointment_id = a.appointment_id
                    WHERE i.staff_id = ?
                    AND DATE_FORMAT(i.created_at, '%Y-%m') = ?
                    ORDER BY i.created_at DESC
                ";

                $stmt = $this->db->prepare($detailQuery);
                $stmt->execute([$staff['staff_id'], $month]);
                $incentivesByStaff[$staff['staff_id']] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            Response::json([
                "status" => "success",
                "data" => [
                    "period" => $month,
                    "overall" => $overall,
                    "staff_breakdown" => $staffBreakdown,
                    "incentives_by_staff" => $incentivesByStaff
                ]
            ]);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to fetch incentives: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ CREATE INCENTIVE (ADMIN only)
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
        $type = $data['type'] ?? 'COMMISSION';
        $calculationType = $data['calculation_type'] ?? 'PERCENTAGE';
        $percentageRate = $data['percentage_rate'] ?? null;
        $baseAmount = $data['base_amount'] ?? null;
        $fixedAmount = $data['incentive_amount'] ?? null;
        $appointmentId = $data['appointment_id'] ?? null;
        $remarks = trim($data['remarks'] ?? '');
        $status = $data['status'] ?? 'PENDING';

        // Validation
        if (!$staffId) {
            Response::json(["status" => "error", "message" => "Staff ID is required"], 400);
        }

        // Verify staff belongs to salon
        $stmt = $this->db->prepare("SELECT staff_id FROM staff_info WHERE staff_id = ? AND salon_id = ?");
        $stmt->execute([$staffId, $salonId]);
        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Staff not found in this salon"], 404);
        }

        // Validate percentage rate (if percentage calculation)
        if ($calculationType === 'PERCENTAGE' && ($percentageRate === null || $percentageRate < 0 || $percentageRate > 100)) {
            Response::json(["status" => "error", "message" => "Valid percentage rate required (0-100)"], 400);
        }

        // Validate base amount (if percentage calculation)
        if ($calculationType === 'PERCENTAGE' && ($baseAmount === null || $baseAmount < 0)) {
            Response::json(["status" => "error", "message" => "Valid base amount required"], 400);
        }

        // Calculate incentive amount if percentage
        if ($calculationType === 'PERCENTAGE') {
            $fixedAmount = ($baseAmount * $percentageRate) / 100;
        }

        // Validate fixed amount
        if ($fixedAmount === null || $fixedAmount < 0) {
            Response::json(["status" => "error", "message" => "Valid incentive amount required"], 400);
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO incentives
                (staff_id, salon_id, type, calculation_type, percentage_rate, base_amount,
                 incentive_amount, appointment_id, remarks, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $staffId,
                $salonId,
                $type,
                $calculationType,
                $percentageRate,
                $baseAmount,
                $fixedAmount,
                $appointmentId,
                $remarks,
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
    | 3️⃣ PROCESS PAYOUT (ADMIN only)
    | - Mark selected incentives as PAID
    |--------------------------------------------------------------------------
    */
    public function processPayout()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $staffId = $data['staff_id'] ?? null;
        $incentiveIds = $data['incentive_ids'] ?? [];
        $paymentMode = $data['payment_mode'] ?? 'CASH';
        $transactionNo = $data['transaction_no'] ?? null;
        $totalAmount = $data['total_amount'] ?? 0;

        // Validation
        if (!$staffId) {
            Response::json(["status" => "error", "message" => "Staff ID is required"], 400);
        }

        if (empty($incentiveIds) || !is_array($incentiveIds)) {
            Response::json(["status" => "error", "message" => "At least one incentive ID is required"], 400);
        }

        // Verify staff belongs to salon
        $stmt = $this->db->prepare("SELECT staff_id FROM staff_info WHERE staff_id = ? AND salon_id = ?");
        $stmt->execute([$staffId, $salonId]);
        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Staff not found in this salon"], 404);
        }

        try {
            $this->db->beginTransaction();

            // Create payout record
            $payoutStmt = $this->db->prepare("
                INSERT INTO incentive_payouts
                (staff_id, payment_mode, transaction_no, amount, payment_date, created_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
            ");
            $payoutStmt->execute([$staffId, $paymentMode, $transactionNo, $totalAmount]);
            $payoutId = $this->db->lastInsertId();

            // Update each incentive status to PAID
            $updateStmt = $this->db->prepare("
                UPDATE incentives
                SET status = 'PAID', updated_at = NOW()
                WHERE incentive_id = ? AND staff_id = ?
            ");

            foreach ($incentiveIds as $incentiveId) {
                $updateStmt->execute([$incentiveId, $staffId]);

                // Link payout to incentive (if payout_incentives table exists)
                try {
                    $linkStmt = $this->db->prepare("
                        INSERT INTO payout_incentives (payout_id, incentive_id, created_at)
                        VALUES (?, ?, NOW())
                    ");
                    $linkStmt->execute([$payoutId, $incentiveId]);
                } catch (Exception $e) {
                    // Table might not exist, continue
                }
            }

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "payout_id" => $payoutId
                ]
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to process payout: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ GET INCENTIVES BY STAFF (ADMIN/STAFF)
    |--------------------------------------------------------------------------
    */
    public function getByStaff()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $staffId = $_GET['staff_id'] ?? null;
        $limit = $_GET['limit'] ?? 50;

        // If STAFF role, they can only view their own incentives
        if ($auth['role'] === 'STAFF') {
            $staffId = $auth['staff_id'];
        }

        if (!$staffId) {
            Response::json(["status" => "error", "message" => "Staff ID required"], 400);
        }

        try {
            $stmt = $this->db->prepare("
                SELECT
                    i.incentive_id,
                    i.staff_id,
                    i.type,
                    i.calculation_type,
                    i.percentage_rate,
                    i.base_amount,
                    i.incentive_amount,
                    i.status,
                    i.remarks,
                    i.created_at,
                    i.updated_at,
                    a.appointment_id,
                    a.appointment_date,
                    c.name as customer_name
                FROM incentives i
                LEFT JOIN appointments a ON i.appointment_id = a.appointment_id
                LEFT JOIN customers c ON a.customer_id = c.customer_id
                WHERE i.staff_id = ?
                ORDER BY i.created_at DESC
                LIMIT ?
            ");

            $stmt->execute([$staffId, (int)$limit]);
            $incentives = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json([
                "status" => "success",
                "data" => [
                    "items" => $incentives
                ]
            ]);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to fetch incentives: " . $e->getMessage()
            ], 500);
        }
    }
}

<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class SalonSubscriptionController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE SALON SUBSCRIPTION (SUPER_ADMIN, ADMIN)
    | - ADMIN: Subscribe own salon to a plan
    | - SUPER_ADMIN: Subscribe any salon to a plan (uses their salon_id from token)
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

        $planId = $data['plan_id'] ?? null;
        $startDate = $data['start_date'] ?? date('Y-m-d');

        // Validation
        if (!$planId) {
            Response::json(["status" => "error", "message" => "Plan ID is required"], 400);
        }

        // Verify plan exists and is active
        $stmt = $this->db->prepare("SELECT * FROM subscription_plans WHERE plan_id = ? AND status = 1");
        $stmt->execute([$planId]);
        $plan = $stmt->fetch();

        if (!$plan) {
            Response::json(["status" => "error", "message" => "Active plan not found"], 404);
        }

        // Calculate end date based on plan duration
        $endDate = date('Y-m-d', strtotime($startDate . " +{$plan['duration_days']} days"));

        // Check if salon already has an active subscription
        $stmt = $this->db->prepare("
            SELECT subscription_id FROM salon_subscriptions
            WHERE salon_id = ? AND status = 'ACTIVE' AND end_date >= CURDATE()
        ");
        $stmt->execute([$salonId]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Salon already has an active subscription"], 409);
        }

        try {
            $this->db->beginTransaction();

            // 1. Create subscription
            $stmt = $this->db->prepare("
                INSERT INTO salon_subscriptions
                (salon_id, plan_id, start_date, end_date, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'ACTIVE', NOW(), NOW())
            ");

            $stmt->execute([
                $salonId,
                $planId,
                $startDate,
                $endDate
            ]);

            $subscriptionId = $this->db->lastInsertId();

            // 2. Auto-create invoice for the subscription with proration for flat plans
            $amount = (float) $plan['flat_price'];
            
            // Calculate proration if subscription starts mid-month
            $startDateTime = new DateTime($startDate);
            $daysInMonth = $startDateTime->format('t'); // Total days in start month
            $dayOfMonth = (int) $startDateTime->format('d');
            
            if ($plan['plan_type'] === 'flat' && $dayOfMonth > 1) {
                // Prorate: charge only for remaining days in the month
                $daysRemaining = $daysInMonth - $dayOfMonth + 1;
                $amount = ($plan['flat_price'] / $daysInMonth) * $daysRemaining;
            }
            
            $taxRate = 0; // Change to 18 for GST
            $taxAmount = ($amount * $taxRate) / 100;
            $totalAmount = $amount + $taxAmount;

            $invoiceNumber = 'INV-SUB-' . $salonId . '-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $dueDate = date('Y-m-d', strtotime('+7 days'));
            $invoiceDate = date('Y-m-d');

            $invoiceStmt = $this->db->prepare("
                INSERT INTO invoice_salon
                (salon_id, subscription_id, invoice_number, amount, tax_amount, total_amount,
                 payment_status, invoice_date, due_date)
                VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', ?, ?)
            ");

            $invoiceStmt->execute([
                $salonId,
                $subscriptionId,
                $invoiceNumber,
                $amount,
                $taxAmount,
                $totalAmount,
                $invoiceDate,
                $dueDate
            ]);

            $invoiceId = $this->db->lastInsertId();

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "subscription_id" => $subscriptionId,
                    "invoice_id" => $invoiceId,
                    "invoice_number" => $invoiceNumber,
                    "total_amount" => $totalAmount,
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ]
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to create subscription: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ UPDATE SALON SUBSCRIPTION (SUPER_ADMIN, ADMIN)
    | - ADMIN: Update own salon's subscription
    | - SUPER_ADMIN: Update any salon's subscription
    |--------------------------------------------------------------------------
    */
    public function update($subscriptionId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify subscription belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM salon_subscriptions WHERE subscription_id = ? AND salon_id = ?");
        $stmt->execute([$subscriptionId, $salonId]);
        $subscription = $stmt->fetch();

        if (!$subscription) {
            Response::json(["status" => "error", "message" => "Subscription not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $allowedFields = ['plan_id', 'start_date', 'end_date', 'status'];
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

        $values[] = $subscriptionId;
        $values[] = $salonId;

        $sql = "UPDATE salon_subscriptions SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE subscription_id = ? AND salon_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ CANCEL SALON SUBSCRIPTION (SUPER_ADMIN, ADMIN)
    | - ADMIN: Cancel own salon's subscription
    | - SUPER_ADMIN: Cancel any salon's subscription (no salon_id in token)
    |--------------------------------------------------------------------------
    */
    public function cancel($subscriptionId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $userRole = $auth['role'] ?? null;
        
        // ✅ SUPER_ADMIN can cancel ANY subscription (no salon_id required)
        if ($userRole === 'SUPER_ADMIN') {
            // Just verify subscription exists
            $stmt = $this->db->prepare("SELECT subscription_id FROM salon_subscriptions WHERE subscription_id = ?");
            $stmt->execute([$subscriptionId]);
            $subscription = $stmt->fetch();
            
            if (!$subscription) {
                Response::json(["status" => "error", "message" => "Subscription not found"], 404);
            }
            
            // Cancel the subscription
            $stmt = $this->db->prepare("
                UPDATE salon_subscriptions
                SET status = 'CANCELLED', updated_at = NOW()
                WHERE subscription_id = ?
            ");
            $stmt->execute([$subscriptionId]);
            
            Response::json([
                "status" => "success",
                "data" => [
                    "subscription_id" => $subscriptionId,
                    "status" => "CANCELLED"
                ]
            ]);
            return;
        }
        
        // ✅ ADMIN logic - requires salon_id
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify subscription belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM salon_subscriptions WHERE subscription_id = ? AND salon_id = ?");
        $stmt->execute([$subscriptionId, $salonId]);
        $subscription = $stmt->fetch();

        if (!$subscription) {
            Response::json(["status" => "error", "message" => "Subscription not found"], 404);
        }

        $stmt = $this->db->prepare("
            UPDATE salon_subscriptions
            SET status = 'CANCELLED', updated_at = NOW()
            WHERE subscription_id = ? AND salon_id = ?
        ");

        $stmt->execute([$subscriptionId, $salonId]);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ VIEW SALON SUBSCRIPTION DETAILS (SUPER_ADMIN, ADMIN)
    | - ADMIN: View own salon's subscription
    | - SUPER_ADMIN: View any salon's subscription
    |--------------------------------------------------------------------------
    */
    public function show($subscriptionId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT ss.*, sp.plan_name, sp.duration_days, sp.plan_type, sp.flat_price
            FROM salon_subscriptions ss
            INNER JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            WHERE ss.subscription_id = ? AND ss.salon_id = ?
        ");

        $stmt->execute([$subscriptionId, $salonId]);
        $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$subscription) {
            Response::json(["status" => "error", "message" => "Subscription not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $subscription
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣.5️⃣ VIEW SUBSCRIPTION DETAILS (SUPER_ADMIN ONLY)
    | View any salon's subscription details (no salon_id required)
    |--------------------------------------------------------------------------
    */
    public function showBySuperAdmin($subscriptionId)
    {
        try {
            // Verify subscription exists - use CORRECT database column names
            $stmt = $this->db->prepare("
                SELECT ss.*, sp.plan_name, sp.duration_days, sp.plan_type, 
                       sp.flat_price, sp.rate_per_appointment, sp.percentage_rate,
                       s.salon_name, s.salon_id as salon_salon_id
                FROM salon_subscriptions ss
                INNER JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
                INNER JOIN salons s ON ss.salon_id = s.salon_id
                WHERE ss.subscription_id = ?
            ");

            $stmt->execute([$subscriptionId]);
            $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$subscription) {
                Response::json(["status" => "error", "message" => "Subscription not found"], 404);
                return;
            }

            // Map database column names to API field names for frontend compatibility
            if ($subscription) {
                $subscription['per_appointments_price'] = $subscription['rate_per_appointment'];
                $subscription['percentage_per_appointment'] = $subscription['percentage_rate'];
                // Keep original columns for backward compatibility
            }

            Response::json([
                "status" => "success",
                "data" => $subscription
            ]);
        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to fetch subscription: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ GET SALON'S CURRENT SUBSCRIPTION (SUPER_ADMIN, ADMIN)
    | - ADMIN: Get own salon's current subscription
    | - SUPER_ADMIN: Get any salon's current subscription
    |--------------------------------------------------------------------------
    */
    public function getCurrentSubscription()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT ss.*, sp.plan_name, sp.duration_days, sp.plan_type, sp.flat_price
            FROM salon_subscriptions ss
            INNER JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            WHERE ss.salon_id = ? AND ss.status = 'ACTIVE' AND ss.end_date >= CURDATE()
            ORDER BY ss.end_date DESC
            LIMIT 1
        ");

        $stmt->execute([$salonId]);
        $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$subscription) {
            Response::json([
                "status" => "success",
                "data" => null,
                "message" => "No active subscription found"
            ]);
        }

        Response::json([
            "status" => "success",
            "data" => $subscription
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 6️⃣ LIST SALON SUBSCRIPTION HISTORY (SUPER_ADMIN, ADMIN)
    | - ADMIN: List own salon's subscription history
    | - SUPER_ADMIN: List any salon's subscription history
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
            SELECT ss.*, sp.plan_name, sp.duration_days
            FROM salon_subscriptions ss
            INNER JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            WHERE ss.salon_id = ?
        ";

        $params = [$salonId];

        if ($status && in_array($status, ['ACTIVE', 'EXPIRED', 'CANCELLED'])) {
            $sql .= " AND ss.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY ss.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $subscriptions
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 7️⃣ CREATE SUBSCRIPTION FOR SALON (SUPER_ADMIN only)
    | Assign subscription plan to any salon
    |--------------------------------------------------------------------------
    */
    public function createForSalon($salonId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $planId = $data['plan_id'] ?? null;
        $startDate = $data['start_date'] ?? date('Y-m-d');
        $endDate = $data['end_date'] ?? null;
        $status = $data['status'] ?? 'ACTIVE';
        $createInvoice = $data['create_invoice'] ?? true; // Default to true for backward compatibility

        // Validation
        if (!$planId) {
            Response::json(["status" => "error", "message" => "Plan ID is required"], 400);
        }

        // Verify salon exists
        $stmt = $this->db->prepare("SELECT salon_id, salon_name FROM salons WHERE salon_id = ?");
        $stmt->execute([$salonId]);
        $salon = $stmt->fetch();

        if (!$salon) {
            Response::json(["status" => "error", "message" => "Salon not found"], 404);
        }

        // Verify plan exists and is active
        $stmt = $this->db->prepare("SELECT * FROM subscription_plans WHERE plan_id = ? AND status = 1");
        $stmt->execute([$planId]);
        $plan = $stmt->fetch();

        if (!$plan) {
            Response::json(["status" => "error", "message" => "Active plan not found"], 404);
        }

        // Calculate end date if not provided
        if (!$endDate) {
            $endDate = date('Y-m-d', strtotime($startDate . " +{$plan['duration_days']} days"));
        }

        // Check if salon already has an active subscription
        $stmt = $this->db->prepare("
            SELECT subscription_id FROM salon_subscriptions
            WHERE salon_id = ? AND status = 'ACTIVE' AND end_date >= CURDATE()
        ");
        $stmt->execute([$salonId]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Salon already has an active subscription"], 409);
        }

        try {
            $this->db->beginTransaction();

            // 1. Create subscription
            $stmt = $this->db->prepare("
                INSERT INTO salon_subscriptions
                (salon_id, plan_id, start_date, end_date, status)
                VALUES (?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $salonId,
                $planId,
                $startDate,
                $endDate,
                $status
            ]);

            $subscriptionId = $this->db->lastInsertId();

            // 2. Optionally create invoice (only if requested)
            $invoiceData = null;
            if ($createInvoice) {
                $amount = (float) $plan['flat_price'];

                // Calculate proration if subscription starts mid-month
                $startDateTime = new DateTime($startDate);
                $daysInMonth = $startDateTime->format('t');
                $dayOfMonth = (int) $startDateTime->format('d');

                if ($plan['plan_type'] === 'flat' && $dayOfMonth > 1) {
                    $daysRemaining = $daysInMonth - $dayOfMonth + 1;
                    $amount = ($plan['flat_price'] / $daysInMonth) * $daysRemaining;
                }

                $taxRate = 0;
                $taxAmount = ($amount * $taxRate) / 100;
                $totalAmount = $amount + $taxAmount;

                $invoiceNumber = 'INV-SUB-' . $salonId . '-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
                $dueDate = date('Y-m-d', strtotime('+7 days'));
                $invoiceDate = date('Y-m-d');

                $invoiceStmt = $this->db->prepare("
                    INSERT INTO invoice_salon
                    (salon_id, subscription_id, invoice_number, amount, tax_amount, total_amount,
                     payment_status, invoice_date, due_date)
                    VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', ?, ?)
                ");

                $invoiceStmt->execute([
                    $salonId,
                    $subscriptionId,
                    $invoiceNumber,
                    $amount,
                    $taxAmount,
                    $totalAmount,
                    $invoiceDate,
                    $dueDate
                ]);

                $invoiceId = $this->db->lastInsertId();
                $invoiceData = [
                    "invoice_id" => $invoiceId,
                    "invoice_number" => $invoiceNumber,
                    "total_amount" => $totalAmount
                ];
            }

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "subscription_id" => $subscriptionId,
                    "invoice" => $invoiceData,
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ],
                "message" => "Subscription created successfully" . ($createInvoice ? " with invoice" : " (no invoice)")
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to create subscription: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 8️⃣ UPDATE SUBSCRIPTION BY SUPER_ADMIN
    | Update subscription dates/status for any salon
    |--------------------------------------------------------------------------
    */
    public function updateBySuperAdmin($subscriptionId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // Verify subscription exists
        $stmt = $this->db->prepare("SELECT * FROM salon_subscriptions WHERE subscription_id = ?");
        $stmt->execute([$subscriptionId]);
        $subscription = $stmt->fetch();

        if (!$subscription) {
            Response::json(["status" => "error", "message" => "Subscription not found"], 404);
        }

        $allowedFields = ['plan_id', 'start_date', 'end_date', 'status'];
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

        $values[] = $subscriptionId;

        $sql = "UPDATE salon_subscriptions SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE subscription_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 9️⃣ LIST SUBSCRIPTIONS BY SALON (SUPER_ADMIN)
    | View all subscriptions for a specific salon
    |--------------------------------------------------------------------------
    */
    public function indexBySalon($salonId)
    {
        // Verify salon exists
        $stmt = $this->db->prepare("SELECT salon_id, salon_name FROM salons WHERE salon_id = ?");
        $stmt->execute([$salonId]);
        $salon = $stmt->fetch();

        if (!$salon) {
            Response::json(["status" => "error", "message" => "Salon not found"], 404);
        }

        $status = $_GET['status'] ?? null;

        $sql = "
            SELECT ss.*, sp.plan_name, sp.duration_days
            FROM salon_subscriptions ss
            INNER JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            WHERE ss.salon_id = ?
        ";
        $params = [$salonId];

        if ($status && in_array($status, ['ACTIVE', 'EXPIRED', 'CANCELLED'])) {
            $sql .= " AND ss.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY ss.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "salon" => [
                    "salon_id" => $salonId,
                    "salon_name" => $salon['salon_name']
                ],
                "items" => $subscriptions
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 🔟 LIST ALL SUBSCRIPTIONS (SUPER_ADMIN ONLY)
    | View all subscriptions across all salons with filters (no pagination)
    |--------------------------------------------------------------------------
    */
    public function listAll()
    {
        $status = $_GET['status'] ?? null;
        $salonId = $_GET['salon_id'] ?? null;
        $planId = $_GET['plan_id'] ?? null;

        $sql = "
            SELECT ss.*, sp.plan_name, sp.duration_days, sp.plan_type, sp.flat_price, s.salon_name
            FROM salon_subscriptions ss
            INNER JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            INNER JOIN salons s ON ss.salon_id = s.salon_id
            WHERE 1=1
        ";
        $params = [];

        if ($status && in_array($status, ['ACTIVE', 'EXPIRED', 'CANCELLED'])) {
            $sql .= " AND ss.status = ?";
            $params[] = $status;
        }

        if ($salonId) {
            $sql .= " AND ss.salon_id = ?";
            $params[] = $salonId;
        }

        if ($planId) {
            $sql .= " AND ss.plan_id = ?";
            $params[] = $planId;
        }

        $sql .= " ORDER BY ss.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $subscriptions,
                "total" => count($subscriptions)
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣1️⃣ GENERATE SUBSCRIPTION INVOICE (SUPER_ADMIN ONLY)
    | Generate invoice for salon subscription billing
    | Frontend calculates amounts, backend just stores
    |--------------------------------------------------------------------------
    */
    public function generateInvoice($subscriptionId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // 1️⃣ Validate required fields
        if (!isset($data['billing_month']) || !isset($data['total_amount'])) {
            Response::json([
                "status" => "error",
                "message" => "Missing required fields: billing_month, total_amount"
            ], 400);
        }

        // 2️⃣ Verify subscription exists
        $stmt = $this->db->prepare("
            SELECT ss.*, sp.plan_name, sp.plan_type, s.salon_name
            FROM salon_subscriptions ss
            INNER JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            INNER JOIN salons s ON ss.salon_id = s.salon_id
            WHERE ss.subscription_id = ?
        ");
        $stmt->execute([$subscriptionId]);
        $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$subscription) {
            Response::json(["status" => "error", "message" => "Subscription not found"], 404);
        }

        $salonId = $subscription['salon_id'];

        // 3️⃣ Validate billing month format (YYYY-MM)
        if (!preg_match('/^\d{4}-\d{2}$/', $data['billing_month'])) {
            Response::json([
                "status" => "error",
                "message" => "Invalid billing_month format. Use YYYY-MM"
            ], 400);
        }

        // 4️⃣ Validate amounts
        $amount = $data['amount'] ?? 0;
        $taxAmount = $data['tax_amount'] ?? 0;
        $totalAmount = $data['total_amount'];

        if ($amount < 0 || $taxAmount < 0 || $totalAmount <= 0) {
            Response::json([
                "status" => "error",
                "message" => "Invalid amount values"
            ], 400);
        }

        // 5️⃣ Validate dates
        $invoiceDate = $data['invoice_date'] ?? date('Y-m-d');
        $dueDate = $data['due_date'] ?? date('Y-m-d', strtotime('+7 days'));

        if (!DateTime::createFromFormat('Y-m-d', $invoiceDate)) {
            Response::json([
                "status" => "error",
                "message" => "Invalid invoice_date format. Use YYYY-MM-DD"
            ], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $dueDate)) {
            Response::json([
                "status" => "error",
                "message" => "Invalid due_date format. Use YYYY-MM-DD"
            ], 400);
        }

        // 6️⃣ Check if invoice already exists for this subscription + billing month
        $stmt = $this->db->prepare("
            SELECT invoice_salon_id FROM invoice_salon
            WHERE subscription_id = ? AND invoice_date LIKE ?
        ");
        $billingMonthPattern = $data['billing_month'] . '%';
        $stmt->execute([$subscriptionId, $billingMonthPattern]);
        $existingInvoice = $stmt->fetch();

        if ($existingInvoice) {
            Response::json([
                "status" => "error",
                "message" => "Invoice already exists for this subscription and billing month",
                "data" => [
                    "invoice_salon_id" => $existingInvoice['invoice_salon_id']
                ]
            ], 409);
        }

        // 7️⃣ Generate invoice number
        $invoiceNumber = 'INV-SUB-' . $salonId . '-' . date('Ymd', strtotime($invoiceDate)) . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

        try {
            // 8️⃣ Insert invoice into invoice_salon table (only existing columns)
            $stmt = $this->db->prepare("
                INSERT INTO invoice_salon
                (salon_id, subscription_id, invoice_number, amount, tax_amount, total_amount,
                 payment_status, invoice_date, due_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $salonId,
                $subscriptionId,
                $invoiceNumber,
                $amount,
                $taxAmount,
                $totalAmount,
                $invoiceDate,
                $dueDate
            ]);

            $invoiceSalonId = $this->db->lastInsertId();

            Response::json([
                "status" => "success",
                "data" => [
                    "invoice_salon_id" => $invoiceSalonId,
                    "invoice_number" => $invoiceNumber,
                    "subscription_id" => $subscriptionId,
                    "salon_id" => $salonId,
                    "billing_month" => $data['billing_month'],
                    "amount" => $amount,
                    "tax_amount" => $taxAmount,
                    "total_amount" => $totalAmount,
                    "payment_status" => "UNPAID",
                    "due_date" => $dueDate
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to generate invoice: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣2️⃣ RENEW SUBSCRIPTION (SUPER_ADMIN ONLY)
    | Extend subscription end date and optionally change plan
    |--------------------------------------------------------------------------
    */
    public function renew($subscriptionId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // 1️⃣ Validate required fields
        if (!isset($data['renewal_days']) || !isset($data['new_end_date'])) {
            Response::json([
                "status" => "error",
                "message" => "Missing required fields: renewal_days, new_end_date"
            ], 400);
        }

        // 2️⃣ Verify subscription exists
        $stmt = $this->db->prepare("
            SELECT ss.*, sp.plan_name, sp.duration_days, s.salon_name
            FROM salon_subscriptions ss
            INNER JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            INNER JOIN salons s ON ss.salon_id = s.salon_id
            WHERE ss.subscription_id = ?
        ");
        $stmt->execute([$subscriptionId]);
        $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$subscription) {
            Response::json(["status" => "error", "message" => "Subscription not found"], 404);
        }

        $salonId = $subscription['salon_id'];
        $renewalDays = (int) $data['renewal_days'];
        $newEndDate = $data['new_end_date'];
        $renewalType = $data['renewal_type'] ?? 'MANUAL';
        $planChange = $data['plan_change'] ?? false;
        $newPlanId = $data['new_plan_id'] ?? null;
        $notes = $data['notes'] ?? '';

        // 3️⃣ Validate renewal days
        if ($renewalDays <= 0 || $renewalDays > 365) {
            Response::json([
                "status" => "error",
                "message" => "Renewal days must be between 1 and 365"
            ], 400);
        }

        // 4️⃣ Validate new end date format
        if (!DateTime::createFromFormat('Y-m-d', $newEndDate)) {
            Response::json([
                "status" => "error",
                "message" => "Invalid new_end_date format. Use YYYY-MM-DD"
            ], 400);
        }

        // 5️⃣ Verify new plan if changing plan
        if ($planChange && $newPlanId) {
            $stmt = $this->db->prepare("SELECT * FROM subscription_plans WHERE plan_id = ? AND status = 1");
            $stmt->execute([$newPlanId]);
            $newPlan = $stmt->fetch();

            if (!$newPlan) {
                Response::json(["status" => "error", "message" => "New plan not found or inactive"], 404);
            }
        }

        try {
            $this->db->beginTransaction();

            // 6️⃣ Update subscription end date and optionally plan
            $updateFields = ['end_date = ?'];
            $updateValues = [$newEndDate];

            if ($planChange && $newPlanId) {
                $updateFields[] = 'plan_id = ?';
                $updateValues[] = $newPlanId;
            }

            $updateValues[] = $subscriptionId;

            $stmt = $this->db->prepare("
                UPDATE salon_subscriptions
                SET " . implode(', ', $updateFields) . ", status = 'ACTIVE', updated_at = NOW()
                WHERE subscription_id = ?
            ");
            $stmt->execute($updateValues);

            // 7️⃣ Log renewal in subscription_renewals table
            $stmt = $this->db->prepare("
                INSERT INTO subscription_renewals
                (subscription_id, previous_end_date, new_end_date, renewal_type, renewed_by,
                 duration_days, plan_changed, old_plan_id, new_plan_id, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $subscriptionId,
                $subscription['end_date'],
                $newEndDate,
                $renewalType,
                $GLOBALS['auth_user']['user_id'] ?? null,
                $renewalDays,
                $planChange ? 1 : 0,
                $planChange ? $subscription['plan_id'] : null,
                $planChange ? $newPlanId : null,
                $notes
            ]);

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "subscription_id" => $subscriptionId,
                    "previous_end_date" => $subscription['end_date'],
                    "new_end_date" => $newEndDate,
                    "renewal_days" => $renewalDays,
                    "renewal_type" => $renewalType,
                    "plan_changed" => $planChange,
                    "new_plan_id" => $newPlanId
                ]
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to renew subscription: " . $e->getMessage()
            ], 500);
        }
    }
}

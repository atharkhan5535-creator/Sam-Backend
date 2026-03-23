<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class SalonInvoiceController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ GENERATE SALON INVOICE (SUPER_ADMIN only)
    | Create invoice for subscription (UPSERT - updates if exists)
    |--------------------------------------------------------------------------
    */
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $salonId = $data['salon_id'] ?? null;
        $subscriptionId = $data['subscription_id'] ?? null;
        $amount = $data['amount'] ?? null;
        $taxAmount = $data['tax_amount'] ?? 0;
        $dueDate = $data['due_date'] ?? date('Y-m-d', strtotime('+7 days'));

        // Validation
        if (!$salonId || !$subscriptionId) {
            Response::json(["status" => "error", "message" => "Salon ID and subscription ID are required"], 400);
        }

        // Verify salon exists
        $stmt = $this->db->prepare("SELECT salon_id FROM salons WHERE salon_id = ?");
        $stmt->execute([$salonId]);
        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Salon not found"], 404);
        }

        // Verify subscription exists and is active
        $stmt = $this->db->prepare("
            SELECT ss.*, sp.flat_price
            FROM salon_subscriptions ss
            INNER JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            WHERE ss.subscription_id = ? AND ss.salon_id = ?
        ");
        $stmt->execute([$subscriptionId, $salonId]);
        $subscription = $stmt->fetch();

        if (!$subscription) {
            Response::json(["status" => "error", "message" => "Active subscription not found for this salon"], 404);
        }

        // Use plan price if amount not provided
        if ($amount === null) {
            $amount = (float) $subscription['flat_price'];
        }

        $totalAmount = $amount + $taxAmount;
        $invoiceDate = date('Y-m-d');

        try {
            $this->db->beginTransaction();

            // Check if invoice already exists for this subscription
            $stmt = $this->db->prepare("SELECT invoice_salon_id, invoice_number FROM invoice_salon WHERE subscription_id = ?");
            $stmt->execute([$subscriptionId]);
            $existingInvoice = $stmt->fetch();

            if ($existingInvoice) {
                // UPDATE existing invoice (UPSERT behavior)
                $stmt = $this->db->prepare("
                    UPDATE invoice_salon
                    SET amount = ?, tax_amount = ?, total_amount = ?, due_date = ?, updated_at = NOW()
                    WHERE invoice_salon_id = ?
                ");

                $stmt->execute([
                    $amount,
                    $taxAmount,
                    $totalAmount,
                    $dueDate,
                    $existingInvoice['invoice_salon_id']
                ]);

                $this->db->commit();

                Response::json([
                    "status" => "success",
                    "data" => [
                        "invoice_salon_id" => $existingInvoice['invoice_salon_id'],
                        "invoice_number" => $existingInvoice['invoice_number'],
                        "amount" => $amount,
                        "tax_amount" => $taxAmount,
                        "total_amount" => $totalAmount,
                        "updated" => true,
                        "message" => "Invoice updated successfully"
                    ]
                ]);
            } else {
                // INSERT new invoice
                $invoiceNumber = 'INV-S-' . $salonId . '-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

                $stmt = $this->db->prepare("
                    INSERT INTO invoice_salon
                    (salon_id, subscription_id, invoice_number, amount, tax_amount, total_amount,
                     payment_status, invoice_date, due_date)
                    VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', ?, ?)
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

                $this->db->commit();

                Response::json([
                    "status" => "success",
                    "data" => [
                        "invoice_salon_id" => $this->db->lastInsertId(),
                        "invoice_number" => $invoiceNumber,
                        "amount" => $amount,
                        "tax_amount" => $taxAmount,
                        "total_amount" => $totalAmount,
                        "updated" => false,
                        "message" => "Invoice created successfully"
                    ]
                ], 201);
            }

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to generate invoice: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ LIST SALON INVOICES (SUPER_ADMIN only)
    | List all salon invoices
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $salonId = $_GET['salon_id'] ?? null;
        $paymentStatus = $_GET['payment_status'] ?? null;

        $sql = "
            SELECT isal.*, sp.plan_name, s.salon_name
            FROM invoice_salon isal
            LEFT JOIN salon_subscriptions ss ON isal.subscription_id = ss.subscription_id
            LEFT JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            LEFT JOIN salons s ON isal.salon_id = s.salon_id
            WHERE 1=1
        ";
        $params = [];

        if ($salonId) {
            $sql .= " AND isal.salon_id = ?";
            $params[] = $salonId;
        }

        if ($paymentStatus && in_array($paymentStatus, ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'])) {
            $sql .= " AND isal.payment_status = ?";
            $params[] = $paymentStatus;
        }

        $sql .= " ORDER BY isal.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch payments for each invoice
        foreach ($invoices as &$invoice) {
            $stmt = $this->db->prepare("
                SELECT payment_salon_id, payment_mode, transaction_no, amount, payment_date
                FROM payments_salon
                WHERE invoice_salon_id = ?
                ORDER BY payment_date DESC
            ");
            $stmt->execute([$invoice['invoice_salon_id']]);
            $invoice['payments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $invoices
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ VIEW SALON INVOICE DETAILS (SUPER_ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function show($invoiceSalonId)
    {
        $stmt = $this->db->prepare("
            SELECT isal.*, sp.plan_name, ss.start_date, ss.end_date, s.salon_name
            FROM invoice_salon isal
            LEFT JOIN salon_subscriptions ss ON isal.subscription_id = ss.subscription_id
            LEFT JOIN subscription_plans sp ON ss.plan_id = sp.plan_id
            LEFT JOIN salons s ON isal.salon_id = s.salon_id
            WHERE isal.invoice_salon_id = ?
        ");
        $stmt->execute([$invoiceSalonId]);
        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$invoice) {
            Response::json(["status" => "error", "message" => "Invoice not found"], 404);
        }

        // Get associated payments
        $stmt = $this->db->prepare("
            SELECT payment_salon_id, payment_mode, transaction_no, amount, payment_date
            FROM payments_salon
            WHERE invoice_salon_id = ?
            ORDER BY payment_date DESC
        ");
        $stmt->execute([$invoiceSalonId]);
        $invoice['payments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => $invoice
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ UPDATE SALON INVOICE (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function update($invoiceSalonId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify invoice exists and belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM invoice_salon WHERE invoice_salon_id = ? AND salon_id = ?");
        $stmt->execute([$invoiceSalonId, $salonId]);
        $invoice = $stmt->fetch();

        if (!$invoice) {
            Response::json(["status" => "error", "message" => "Invoice not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $allowedFields = ['amount', 'tax_amount', 'due_date'];
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

        // Recalculate total if amount or tax changed
        $amount = isset($data['amount']) ? $data['amount'] : $invoice['amount'];
        $taxAmount = isset($data['tax_amount']) ? $data['tax_amount'] : $invoice['tax_amount'];
        $totalAmount = $amount + $taxAmount;

        $updates[] = "total_amount = ?";
        $values[] = $totalAmount;

        $values[] = $invoiceSalonId;
        $values[] = $salonId;

        $sql = "UPDATE invoice_salon SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE invoice_salon_id = ? AND salon_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ GET INVOICE BY SUBSCRIPTION ID (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function getBySubscription($subscriptionId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT isal.*, sp.plan_name
            FROM invoice_salon isal
            LEFT JOIN subscription_plans sp ON isal.subscription_id = sp.plan_id
            WHERE isal.subscription_id = ? AND isal.salon_id = ?
        ");
        $stmt->execute([$subscriptionId, $salonId]);
        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$invoice) {
            Response::json(["status" => "error", "message" => "Invoice not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $invoice
        ]);
    }
}

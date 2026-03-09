<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class CustomerPaymentController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE PAYMENT (ADMIN, STAFF) - Record payment against invoice
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

        $invoiceCustomerId = $data['invoice_customer_id'] ?? null;
        $paymentMode = $data['payment_mode'] ?? null;
        $transactionNo = trim($data['transaction_no'] ?? '');
        $amount = $data['amount'] ?? null;
        $paymentDate = $data['payment_date'] ?? date('Y-m-d H:i:s');

        // 1️⃣ Invoice ID Required
        if (!$invoiceCustomerId) {
            Response::json(["status" => "error", "message" => "Invoice ID is required"], 400);
        }

        // 2️⃣ Payment Mode Enum Validation
        $validModes = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET'];
        if (!$paymentMode || !in_array($paymentMode, $validModes)) {
            Response::json(["status" => "error", "message" => "Valid payment mode is required"], 400);
        }

        // 3️⃣ Payment Amount Range Validation (0.01 to 10,000,000)
        if ($amount === null || $amount <= 0 || $amount > 10000000) {
            Response::json(["status" => "error", "message" => "Valid payment amount is required (0.01 to 10,000,000)"], 400);
        }

        // 4️⃣ Payment Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d H:i:s', $paymentDate)) {
            Response::json(["status" => "error", "message" => "Invalid payment datetime format (use YYYY-MM-DD HH:MM:SS)"], 400);
        }

        // Verify invoice exists and belongs to salon
        $stmt = $this->db->prepare("
            SELECT * FROM invoice_customer 
            WHERE invoice_customer_id = ? AND salon_id = ?
        ");
        $stmt->execute([$invoiceCustomerId, $salonId]);
        $invoice = $stmt->fetch();

        if (!$invoice) {
            Response::json(["status" => "error", "message" => "Invoice not found"], 404);
        }

        // Check if invoice is already fully paid
        if ($invoice['payment_status'] === 'PAID') {
            Response::json(["status" => "error", "message" => "Invoice is already fully paid"], 400);
        }

        // Calculate total paid amount
        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(amount), 0) AS total_paid
            FROM customer_payments
            WHERE invoice_customer_id = ? AND status = 'SUCCESS'
        ");
        $stmt->execute([$invoiceCustomerId]);
        $totalPaid = $stmt->fetchColumn();

        // Check if payment would exceed outstanding amount
        $outstandingAmount = $invoice['total_amount'] - $totalPaid;
        if ($amount > $outstandingAmount) {
            Response::json([
                "status" => "error",
                "message" => "Payment amount exceeds outstanding balance. Outstanding: $outstandingAmount"
            ], 400);
        }

        try {
            $this->db->beginTransaction();

            // Insert payment record
            $stmt = $this->db->prepare("
                INSERT INTO customer_payments
                (invoice_customer_id, payment_mode, transaction_no, amount, payment_date, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'SUCCESS', NOW(), NOW())
            ");

            $stmt->execute([
                $invoiceCustomerId,
                $paymentMode,
                $transactionNo ?: null,
                $amount,
                $paymentDate
            ]);

            $paymentId = $this->db->lastInsertId();

            // Update invoice payment status
            $newTotalPaid = $totalPaid + $amount;
            $newOutstanding = $invoice['total_amount'] - $newTotalPaid;

            if ($newOutstanding <= 0) {
                $paymentStatus = 'PAID';
            } elseif ($newTotalPaid > 0) {
                $paymentStatus = 'PARTIAL';
            } else {
                $paymentStatus = 'UNPAID';
            }

            $stmt = $this->db->prepare("
                UPDATE invoice_customer
                SET payment_status = ?, updated_at = NOW()
                WHERE invoice_customer_id = ?
            ");
            $stmt->execute([$paymentStatus, $invoiceCustomerId]);

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "payment_id" => $paymentId,
                    "amount_paid" => $amount,
                    "total_paid" => $newTotalPaid,
                    "outstanding" => $newOutstanding,
                    "payment_status" => $paymentStatus
                ]
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to process payment: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ LIST PAYMENTS (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;
        $userRole = $auth['role'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $status = $_GET['status'] ?? null;
        $invoiceCustomerId = $_GET['invoice_id'] ?? null;

        $sql = "
            SELECT cp.*, ic.invoice_number, c.name AS customer_name
            FROM customer_payments cp
            INNER JOIN invoice_customer ic ON cp.invoice_customer_id = ic.invoice_customer_id
            INNER JOIN customers c ON ic.customer_id = c.customer_id
            WHERE ic.salon_id = ?
        ";

        $params = [$salonId];

        // CUSTOMER can only see their own payments
        if ($userRole === 'CUSTOMER') {
            $sql .= " AND ic.customer_id = ?";
            $params[] = $auth['customer_id'];
        }

        if ($invoiceCustomerId) {
            $sql .= " AND cp.invoice_customer_id = ?";
            $params[] = $invoiceCustomerId;
        }

        if ($status && in_array($status, ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'])) {
            $sql .= " AND cp.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY cp.payment_date DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $payments
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ VIEW PAYMENT DETAILS (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function show($paymentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // ✅ SECURITY FIX: Check authorization BEFORE fetching data
        // If CUSTOMER, include customer_id in WHERE clause to prevent unauthorized access
        if ($auth['role'] === 'CUSTOMER') {
            $stmt = $this->db->prepare("
                SELECT cp.*, ic.invoice_number, ic.total_amount, c.name AS customer_name
                FROM customer_payments cp
                INNER JOIN invoice_customer ic ON cp.invoice_customer_id = ic.invoice_customer_id
                INNER JOIN customers c ON ic.customer_id = c.customer_id
                WHERE cp.customer_payment_id = ? AND ic.salon_id = ? AND ic.customer_id = ?
            ");
            $stmt->execute([$paymentId, $salonId, $auth['customer_id']]);
        } else {
            // ADMIN/STAFF can view any payment in their salon
            $stmt = $this->db->prepare("
                SELECT cp.*, ic.invoice_number, ic.total_amount, c.name AS customer_name
                FROM customer_payments cp
                INNER JOIN invoice_customer ic ON cp.invoice_customer_id = ic.invoice_customer_id
                INNER JOIN customers c ON ic.customer_id = c.customer_id
                WHERE cp.customer_payment_id = ? AND ic.salon_id = ?
            ");
            $stmt->execute([$paymentId, $salonId]);
        }

        $payment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$payment) {
            Response::json(["status" => "error", "message" => "Payment not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $payment
        ]);
    }
}

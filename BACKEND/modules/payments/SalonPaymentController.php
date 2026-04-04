<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class SalonPaymentController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE SALON PAYMENT (ADMIN only)
    | Record payment against salon invoice
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

        $invoiceSalonId = $data['invoice_salon_id'] ?? null;
        $paymentMode = $data['payment_mode'] ?? null;
        $transactionNo = trim($data['transaction_no'] ?? '');
        $amount = $data['amount'] ?? null;
        $paymentDate = $data['payment_date'] ?? date('Y-m-d H:i:s');

        // Validation
        if (!$invoiceSalonId) {
            Response::json(["status" => "error", "message" => "Invoice ID is required"], 400);
        }

        $validModes = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE'];
        if (!$paymentMode || !in_array($paymentMode, $validModes)) {
            Response::json(["status" => "error", "message" => "Valid payment mode is required"], 400);
        }

        if ($amount === null || $amount <= 0) {
            Response::json(["status" => "error", "message" => "Valid payment amount is required"], 400);
        }

        // Verify invoice exists and belongs to salon
        $stmt = $this->db->prepare("
            SELECT * FROM invoice_salon
            WHERE invoice_salon_id = ? AND salon_id = ?
        ");
        $stmt->execute([$invoiceSalonId, $salonId]);
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
            FROM payments_salon
            WHERE invoice_salon_id = ?
        ");
        $stmt->execute([$invoiceSalonId]);
        $totalPaid = $stmt->fetchColumn();

        // Check if payment would exceed outstanding amount
        $outstandingAmount = round($invoice['total_amount'] - $totalPaid, 2);
        if (round($amount, 2) > $outstandingAmount) {
            Response::json([
                "status" => "error",
                "message" => "Payment amount exceeds outstanding balance. Outstanding: $outstandingAmount"
            ], 400);
        }

        try {
            $this->db->beginTransaction();

            // Insert payment record
            $stmt = $this->db->prepare("
                INSERT INTO payments_salon
                (invoice_salon_id, payment_mode, transaction_no, amount, payment_date)
                VALUES (?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $invoiceSalonId,
                $paymentMode,
                $transactionNo ?: null,
                $amount,
                $paymentDate
            ]);

            $paymentId = $this->db->lastInsertId();

            // Update invoice payment status
            $newTotalPaid = $totalPaid + $amount;
            $newOutstanding = $invoice['total_amount'] - $newTotalPaid;

            if ($newOutstanding <= 0.01) { // Allow small floating point difference
                $paymentStatus = 'PAID';
            } elseif ($newTotalPaid > 0) {
                $paymentStatus = 'PARTIAL';
            } else {
                $paymentStatus = 'UNPAID';
            }

            $stmt = $this->db->prepare("
                UPDATE invoice_salon
                SET payment_status = ?, updated_at = NOW()
                WHERE invoice_salon_id = ?
            ");
            $stmt->execute([$paymentStatus, $invoiceSalonId]);

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
    | 2️⃣ LIST SALON PAYMENTS (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $invoiceSalonId = $_GET['invoice_id'] ?? null;

        $sql = "
            SELECT ps.*, isal.invoice_number
            FROM payments_salon ps
            INNER JOIN invoice_salon isal ON ps.invoice_salon_id = isal.invoice_salon_id
            WHERE isal.salon_id = ?
        ";
        $params = [$salonId];

        if ($invoiceSalonId) {
            $sql .= " AND ps.invoice_salon_id = ?";
            $params[] = $invoiceSalonId;
        }

        $sql .= " ORDER BY ps.payment_date DESC";

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
    | 3️⃣ VIEW SALON PAYMENT DETAILS (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function show($paymentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT ps.*, isal.invoice_number, isal.total_amount
            FROM payments_salon ps
            INNER JOIN invoice_salon isal ON ps.invoice_salon_id = isal.invoice_salon_id
            WHERE ps.payment_salon_id = ? AND isal.salon_id = ?
        ");
        $stmt->execute([$paymentId, $salonId]);
        $payment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$payment) {
            Response::json(["status" => "error", "message" => "Payment not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $payment
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ RECORD PAYMENT FOR SALON INVOICE (SUPER_ADMIN only)
    | Record payment against specific invoice
    |--------------------------------------------------------------------------
    */
    public function recordPayment($invoiceSalonId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $paymentMode = $data['payment_mode'] ?? null;
        $transactionNo = trim($data['transaction_no'] ?? '');
        $amount = $data['amount'] ?? null;
        $paymentDate = $data['payment_date'] ?? date('Y-m-d H:i:s');

        // Validation
        $validModes = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE'];
        if (!$paymentMode || !in_array($paymentMode, $validModes)) {
            Response::json(["status" => "error", "message" => "Valid payment mode is required"], 400);
        }

        if ($amount === null || $amount <= 0) {
            Response::json(["status" => "error", "message" => "Valid payment amount is required"], 400);
        }

        // Verify invoice exists
        $stmt = $this->db->prepare("
            SELECT * FROM invoice_salon
            WHERE invoice_salon_id = ?
        ");
        $stmt->execute([$invoiceSalonId]);
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
            FROM payments_salon
            WHERE invoice_salon_id = ?
        ");
        $stmt->execute([$invoiceSalonId]);
        $totalPaid = $stmt->fetchColumn();

        // Check if payment would exceed outstanding amount
        $outstandingAmount = round($invoice['total_amount'] - $totalPaid, 2);
        if (round($amount, 2) > $outstandingAmount) {
            Response::json([
                "status" => "error",
                "message" => "Payment amount exceeds outstanding balance. Outstanding: $outstandingAmount"
            ], 400);
        }

        try {
            $this->db->beginTransaction();

            // Insert payment record
            $stmt = $this->db->prepare("
                INSERT INTO payments_salon
                (invoice_salon_id, payment_mode, transaction_no, amount, payment_date)
                VALUES (?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $invoiceSalonId,
                $paymentMode,
                $transactionNo ?: null,
                $amount,
                $paymentDate
            ]);

            $paymentId = $this->db->lastInsertId();

            // Update invoice payment status
            $newTotalPaid = $totalPaid + $amount;
            $newOutstanding = $invoice['total_amount'] - $newTotalPaid;

            if ($newOutstanding <= 0.01) {
                $paymentStatus = 'PAID';
            } elseif ($newTotalPaid > 0) {
                $paymentStatus = 'PARTIAL';
            } else {
                $paymentStatus = 'UNPAID';
            }

            $stmt = $this->db->prepare("
                UPDATE invoice_salon
                SET payment_status = ?, updated_at = NOW()
                WHERE invoice_salon_id = ?
            ");
            $stmt->execute([$paymentStatus, $invoiceSalonId]);

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "payment_salon_id" => $paymentId,
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
}

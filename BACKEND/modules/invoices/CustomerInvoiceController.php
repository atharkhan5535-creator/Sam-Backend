<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class CustomerInvoiceController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE INVOICE (ADMIN, STAFF) - Generated from appointment
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

        $appointmentId = $data['appointment_id'] ?? null;
        $customerId = $data['customer_id'] ?? null;
        $subtotalAmount = $data['subtotal_amount'] ?? null;
        $taxAmount = $data['tax_amount'] ?? 0;
        $discountAmount = $data['discount_amount'] ?? 0;
        $dueDate = $data['due_date'] ?? null;
        $notes = trim($data['notes'] ?? '');

        // 1️⃣ Appointment ID Required
        if (!$appointmentId) {
            Response::json(["status" => "error", "message" => "Appointment ID is required"], 400);
        }

        // 2️⃣ Amount Range Validation (0 to 10,000,000)
        if ($subtotalAmount !== null && ($subtotalAmount < 0 || $subtotalAmount > 10000000)) {
            Response::json(["status" => "error", "message" => "Invalid subtotal amount"], 400);
        }

        if ($taxAmount < 0 || $taxAmount > 1000000) {
            Response::json(["status" => "error", "message" => "Invalid tax amount"], 400);
        }

        if ($discountAmount < 0 || $discountAmount > ($subtotalAmount ?? 0)) {
            Response::json(["status" => "error", "message" => "Invalid discount amount"], 400);
        }

        // 3️⃣ Due Date Format Validation (if provided)
        if ($dueDate && !DateTime::createFromFormat('Y-m-d', $dueDate)) {
            Response::json(["status" => "error", "message" => "Invalid due date format (use YYYY-MM-DD)"], 400);
        }

        // Verify appointment belongs to salon
        $stmt = $this->db->prepare("
            SELECT a.*, c.customer_id 
            FROM appointments a
            INNER JOIN customers c ON a.customer_id = c.customer_id
            WHERE a.appointment_id = ? AND a.salon_id = ?
        ");
        $stmt->execute([$appointmentId, $salonId]);
        $appointment = $stmt->fetch();

        if (!$appointment) {
            Response::json(["status" => "error", "message" => "Appointment not found"], 404);
        }

        $customerId = $appointment['customer_id'];

        // Check if invoice already exists for this appointment
        $stmt = $this->db->prepare("SELECT invoice_customer_id FROM invoice_customer WHERE appointment_id = ?");
        $stmt->execute([$appointmentId]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Invoice already exists for this appointment"], 409);
        }

        // Generate invoice number
        $invoiceNumber = 'INV-' . $salonId . '-' . date('Ymd') . '-' . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

        // Calculate totals if not provided
        if ($subtotalAmount === null) {
            $subtotalAmount = $appointment['final_amount'] ?? 0;
        }

        $totalAmount = $subtotalAmount + $taxAmount - $discountAmount;

        try {
            $stmt = $this->db->prepare("
                INSERT INTO invoice_customer
                (appointment_id, salon_id, customer_id, invoice_number, subtotal_amount, tax_amount, 
                 discount_amount, total_amount, payment_status, invoice_date, due_date, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', CURDATE(), ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $appointmentId,
                $salonId,
                $customerId,
                $invoiceNumber,
                $subtotalAmount,
                $taxAmount,
                $discountAmount,
                $totalAmount,
                $dueDate ?: null,
                $notes ?: null
            ]);

            Response::json([
                "status" => "success",
                "data" => [
                    "invoice_customer_id" => $this->db->lastInsertId(),
                    "invoice_number" => $invoiceNumber
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to create invoice: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ UPDATE INVOICE (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function update($invoiceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify invoice belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM invoice_customer WHERE invoice_customer_id = ? AND salon_id = ?");
        $stmt->execute([$invoiceId, $salonId]);
        $invoice = $stmt->fetch();

        if (!$invoice) {
            Response::json(["status" => "error", "message" => "Invoice not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $allowedFields = ['subtotal_amount', 'tax_amount', 'discount_amount', 'due_date', 'notes'];
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

        // Recalculate total
        $subtotal = isset($data['subtotal_amount']) ? $data['subtotal_amount'] : $invoice['subtotal_amount'];
        $tax = isset($data['tax_amount']) ? $data['tax_amount'] : $invoice['tax_amount'];
        $discount = isset($data['discount_amount']) ? $data['discount_amount'] : $invoice['discount_amount'];
        $total = $subtotal + $tax - $discount;

        $updates[] = "total_amount = ?";
        $values[] = $total;

        $values[] = $invoiceId;
        $values[] = $salonId;

        $sql = "UPDATE invoice_customer SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE invoice_customer_id = ? AND salon_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ LIST INVOICES (ADMIN, STAFF, CUSTOMER)
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

        $paymentStatus = $_GET['payment_status'] ?? null;
        $invoiceDate = $_GET['invoice_date'] ?? null;

        $sql = "
            SELECT ic.*, c.name AS customer_name, c.phone AS customer_phone, a.appointment_date
            FROM invoice_customer ic
            INNER JOIN customers c ON ic.customer_id = c.customer_id
            INNER JOIN appointments a ON ic.appointment_id = a.appointment_id
            WHERE ic.salon_id = ?
        ";

        $params = [$salonId];

        // CUSTOMER can only see their own invoices
        if ($userRole === 'CUSTOMER') {
            $sql .= " AND ic.customer_id = ?";
            $params[] = $auth['customer_id'];
        }

        if ($paymentStatus) {
            $sql .= " AND ic.payment_status = ?";
            $params[] = $paymentStatus;
        }

        if ($invoiceDate) {
            $sql .= " AND ic.invoice_date = ?";
            $params[] = $invoiceDate;
        }

        $sql .= " ORDER BY ic.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $invoices
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ VIEW INVOICE DETAILS (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function show($invoiceId)
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
                SELECT ic.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email,
                       a.appointment_date, a.start_time
                FROM invoice_customer ic
                INNER JOIN customers c ON ic.customer_id = c.customer_id
                INNER JOIN appointments a ON ic.appointment_id = a.appointment_id
                WHERE ic.invoice_customer_id = ? AND ic.salon_id = ? AND ic.customer_id = ?
            ");
            $stmt->execute([$invoiceId, $salonId, $auth['customer_id']]);
        } else {
            // ADMIN/STAFF can view any invoice in their salon
            $stmt = $this->db->prepare("
                SELECT ic.*, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email,
                       a.appointment_date, a.start_time
                FROM invoice_customer ic
                INNER JOIN customers c ON ic.customer_id = c.customer_id
                INNER JOIN appointments a ON ic.appointment_id = a.appointment_id
                WHERE ic.invoice_customer_id = ? AND ic.salon_id = ?
            ");
            $stmt->execute([$invoiceId, $salonId]);
        }

        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$invoice) {
            Response::json(["status" => "error", "message" => "Invoice not found"], 404);
        }

        // Get associated payments
        $stmt = $this->db->prepare("
            SELECT customer_payment_id, payment_mode, transaction_no, amount, payment_date, status
            FROM customer_payments
            WHERE invoice_customer_id = ?
            ORDER BY payment_date DESC
        ");
        $stmt->execute([$invoiceId]);
        $invoice['payments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => $invoice
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ GET INVOICE BY APPOINTMENT ID (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function getByAppointment($appointmentId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT ic.*, c.name AS customer_name
            FROM invoice_customer ic
            INNER JOIN customers c ON ic.customer_id = c.customer_id
            WHERE ic.appointment_id = ? AND ic.salon_id = ?
        ");

        $stmt->execute([$appointmentId, $salonId]);
        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$invoice) {
            Response::json(["status" => "error", "message" => "Invoice not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $invoice
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 6️⃣ RECORD PAYMENT FOR CUSTOMER INVOICE (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function recordPayment($invoiceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        // ✅ SECURITY FIX: Check authorization BEFORE fetching invoice data
        // If CUSTOMER, include customer_id in WHERE clause to prevent unauthorized access
        if ($auth['role'] === 'CUSTOMER') {
            $stmt = $this->db->prepare("SELECT * FROM invoice_customer WHERE invoice_customer_id = ? AND salon_id = ? AND customer_id = ?");
            $stmt->execute([$invoiceId, $salonId, $auth['customer_id']]);
        } else {
            // ADMIN/STAFF can record payment for any invoice in their salon
            $stmt = $this->db->prepare("SELECT * FROM invoice_customer WHERE invoice_customer_id = ? AND salon_id = ?");
            $stmt->execute([$invoiceId, $salonId]);
        }

        $invoice = $stmt->fetch();

        if (!$invoice) {
            Response::json(["status" => "error", "message" => "Invoice not found"], 404);
        }

        $paymentMode = $data['payment_mode'] ?? null;
        $transactionNo = trim($data['transaction_no'] ?? '');
        $amount = $data['amount'] ?? null;
        $paymentDate = $data['payment_date'] ?? date('Y-m-d H:i:s');

        // Validation
        $validModes = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET'];
        if (!$paymentMode || !in_array($paymentMode, $validModes)) {
            Response::json(["status" => "error", "message" => "Valid payment mode is required"], 400);
        }

        if ($amount === null || $amount <= 0) {
            Response::json(["status" => "error", "message" => "Valid payment amount is required"], 400);
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
        $stmt->execute([$invoiceId]);
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
                $invoiceId,
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
                UPDATE invoice_customer
                SET payment_status = ?, updated_at = NOW()
                WHERE invoice_customer_id = ?
            ");
            $stmt->execute([$paymentStatus, $invoiceId]);

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "customer_payment_id" => $paymentId,
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
    | 7️⃣ GET INVOICE PAYMENTS (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function getPayments($invoiceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // ✅ SECURITY FIX: Check authorization BEFORE fetching invoice data
        // If CUSTOMER, include customer_id in WHERE clause to prevent unauthorized access
        if ($auth['role'] === 'CUSTOMER') {
            $stmt = $this->db->prepare("SELECT * FROM invoice_customer WHERE invoice_customer_id = ? AND salon_id = ? AND customer_id = ?");
            $stmt->execute([$invoiceId, $salonId, $auth['customer_id']]);
        } else {
            // ADMIN/STAFF can view payments for any invoice in their salon
            $stmt = $this->db->prepare("SELECT * FROM invoice_customer WHERE invoice_customer_id = ? AND salon_id = ?");
            $stmt->execute([$invoiceId, $salonId]);
        }

        $invoice = $stmt->fetch();

        if (!$invoice) {
            Response::json(["status" => "error", "message" => "Invoice not found"], 404);
        }

        $stmt = $this->db->prepare("
            SELECT customer_payment_id, invoice_customer_id, payment_mode, transaction_no,
                   amount, payment_date, status, created_at
            FROM customer_payments
            WHERE invoice_customer_id = ?
            ORDER BY payment_date DESC
        ");
        $stmt->execute([$invoiceId]);
        $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $payments
            ]
        ]);
    }
}
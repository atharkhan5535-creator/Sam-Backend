<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class StockTransactionController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE STOCK TRANSACTION - IN/OUT/ADJUSTMENT (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function create()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;
        $userId = $auth['user_id'] ?? null;

        if (!$salonId || !$userId) {
            Response::json(["status" => "error", "message" => "Invalid salon or user context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $productId = $data['product_id'] ?? null;
        $transactionType = $data['transaction_type'] ?? null;
        $quantity = $data['quantity'] ?? null;
        $unitPrice = $data['unit_price'] ?? 0;
        $referenceType = trim($data['reference_type'] ?? '');
        $referenceId = $data['reference_id'] ?? null;
        $notes = trim($data['notes'] ?? '');

        // 1️⃣ Product ID Required
        if (!$productId) {
            Response::json(["status" => "error", "message" => "Product ID is required"], 400);
        }

        // 2️⃣ Transaction Type Enum Validation
        $validTypes = ['IN', 'OUT', 'ADJUSTMENT'];
        if (!$transactionType || !in_array($transactionType, $validTypes)) {
            Response::json(["status" => "error", "message" => "Transaction type must be IN, OUT, or ADJUSTMENT"], 400);
        }

        // 3️⃣ Quantity Range Validation (1-10,000)
        if ($quantity === null || $quantity <= 0 || $quantity > 10000) {
            Response::json(["status" => "error", "message" => "Valid quantity is required (1 to 10,000)"], 400);
        }

        // 4️⃣ Unit Price Range Validation (0-1,000,000)
        if ($unitPrice < 0 || $unitPrice > 1000000) {
            Response::json(["status" => "error", "message" => "Invalid unit price (0 to 1,000,000)"], 400);
        }

        // Verify product belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM products WHERE product_id = ? AND salon_id = ?");
        $stmt->execute([$productId, $salonId]);
        $product = $stmt->fetch();

        if (!$product) {
            Response::json(["status" => "error", "message" => "Product not found"], 404);
        }

        // Get current stock
        $stmt = $this->db->prepare("SELECT * FROM stock WHERE product_id = ? AND salon_id = ?");
        $stmt->execute([$productId, $salonId]);
        $stock = $stmt->fetch();

        if (!$stock) {
            Response::json(["status" => "error", "message" => "Stock record not found for this product"], 404);
        }

        // Calculate new quantity based on transaction type
        $currentQty = $stock['current_quantity'];
        $newQty = $currentQty;

        if ($transactionType === 'IN') {
            $newQty = $currentQty + $quantity;
        } elseif ($transactionType === 'OUT') {
            if ($quantity > $currentQty) {
                Response::json([
                    "status" => "error",
                    "message" => "Insufficient stock. Current quantity: $currentQty"
                ], 400);
            }
            $newQty = $currentQty - $quantity;
        } elseif ($transactionType === 'ADJUSTMENT') {
            $newQty = $quantity; // For adjustment, quantity is the new target
        }

        $totalAmount = $quantity * $unitPrice;

        try {
            $this->db->beginTransaction();

            // Insert transaction record
            $stmt = $this->db->prepare("
                INSERT INTO stock_transactions
                (stock_id, user_id, transaction_type, quantity, unit_price, total_amount, reference_type, reference_id, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $stock['stock_id'],
                $userId,
                $transactionType,
                $quantity,
                $unitPrice,
                $totalAmount,
                $referenceType ?: null,
                $referenceId ?: null,
                $notes ?: null
            ]);

            $transactionId = $this->db->lastInsertId();

            // Update stock quantity
            $stmt = $this->db->prepare("
                UPDATE stock
                SET current_quantity = ?, last_restocked = NOW(), updated_at = NOW()
                WHERE stock_id = ?
            ");
            $stmt->execute([$newQty, $stock['stock_id']]);

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "transaction_id" => $transactionId,
                    "product_id" => $productId,
                    "transaction_type" => $transactionType,
                    "quantity" => $quantity,
                    "previous_quantity" => $currentQty,
                    "new_quantity" => $newQty,
                    "total_amount" => $totalAmount
                ]
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to create transaction: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ LIST STOCK TRANSACTIONS (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $productId = $_GET['product_id'] ?? null;
        $transactionType = $_GET['transaction_type'] ?? null;

        $sql = "
            SELECT st.*, p.product_name, u.username
            FROM stock_transactions st
            INNER JOIN stock s ON st.stock_id = s.stock_id
            INNER JOIN products p ON s.product_id = p.product_id
            LEFT JOIN users u ON st.user_id = u.user_id
            WHERE s.salon_id = ?
        ";

        $params = [$salonId];

        if ($productId) {
            $sql .= " AND s.product_id = ?";
            $params[] = $productId;
        }

        if ($transactionType && in_array($transactionType, ['IN', 'OUT', 'ADJUSTMENT'])) {
            $sql .= " AND st.transaction_type = ?";
            $params[] = $transactionType;
        }

        $sql .= " ORDER BY st.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $transactions
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ VIEW STOCK TRANSACTION (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function show($transactionId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT st.*, p.product_name, u.username
            FROM stock_transactions st
            INNER JOIN stock s ON st.stock_id = s.stock_id
            INNER JOIN products p ON s.product_id = p.product_id
            LEFT JOIN users u ON st.user_id = u.user_id
            WHERE st.transaction_id = ? AND s.salon_id = ?
        ");

        $stmt->execute([$transactionId, $salonId]);
        $transaction = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$transaction) {
            Response::json(["status" => "error", "message" => "Transaction not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $transaction
        ]);
    }
}

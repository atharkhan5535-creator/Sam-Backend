<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class StockController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | PRODUCTS - CREATE PRODUCT (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function createProduct()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $productName = trim($data['product_name'] ?? '');
        $brand = trim($data['brand'] ?? '');
        $category = $data['category'] ?? 'product';
        $description = trim($data['description'] ?? '');

        // 1️⃣ Product Name Required
        if (!$productName) {
            Response::json(["status" => "error", "message" => "Product name is required"], 400);
        }

        // 2️⃣ Product Name Length Validation (1-100 characters)
        if (strlen($productName) < 1 || strlen($productName) > 100) {
            Response::json(["status" => "error", "message" => "Product name must be between 1 and 100 characters"], 400);
        }

        // 3️⃣ Category Enum Validation
        if (!in_array($category, ['product', 'equipment'])) {
            Response::json(["status" => "error", "message" => "Category must be 'product' or 'equipment'"], 400);
        }

        // 4️⃣ Quantity Range Validation
        $minQty = $data['minimum_quantity'] ?? 10;
        $maxQty = $data['maximum_quantity'] ?? 100;
        $currentQty = $data['initial_quantity'] ?? 0;

        if ($minQty < 0 || $minQty > 10000) {
            Response::json(["status" => "error", "message" => "Invalid minimum quantity (0 to 10,000)"], 400);
        }

        if ($maxQty < 0 || $maxQty > 10000) {
            Response::json(["status" => "error", "message" => "Invalid maximum quantity (0 to 10,000)"], 400);
        }

        // 5️⃣ Min/Max Logic Validation
        if ($minQty > $maxQty) {
            Response::json(["status" => "error", "message" => "Minimum quantity cannot exceed maximum quantity"], 400);
        }

        // 6️⃣ Initial Quantity Validation
        if ($currentQty < 0 || $currentQty > 10000) {
            Response::json(["status" => "error", "message" => "Invalid initial quantity (0 to 10,000)"], 400);
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO products
                (salon_id, product_name, brand, category, description, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $salonId,
                $productName,
                $brand ?: null,
                $category,
                $description ?: null
            ]);

            $productId = $this->db->lastInsertId();

            // Initialize stock record with default values
            $minQty = $data['minimum_quantity'] ?? 10;
            $maxQty = $data['maximum_quantity'] ?? 100;
            $currentQty = $data['initial_quantity'] ?? 0;

            $stmt = $this->db->prepare("
                INSERT INTO stock
                (product_id, salon_id, current_quantity, minimum_quantity, maximum_quantity, last_restocked, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())
            ");

            $stmt->execute([
                $productId,
                $salonId,
                $currentQty,
                $minQty,
                $maxQty
            ]);

            Response::json([
                "status" => "success",
                "data" => [
                    "product_id" => $productId,
                    "stock_id" => $this->db->lastInsertId()
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to create product: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | PRODUCTS - UPDATE PRODUCT (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function updateProduct($productId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify product belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM products WHERE product_id = ? AND salon_id = ?");
        $stmt->execute([$productId, $salonId]);
        $product = $stmt->fetch();

        if (!$product) {
            Response::json(["status" => "error", "message" => "Product not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $allowedFields = ['product_name', 'brand', 'category', 'description'];
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

        $values[] = $productId;
        $values[] = $salonId;

        $sql = "UPDATE products SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE product_id = ? AND salon_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | PRODUCTS - LIST PRODUCTS (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function listProducts()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $category = $_GET['category'] ?? null;

        $sql = "
            SELECT p.*, s.current_quantity, s.minimum_quantity, s.maximum_quantity, s.last_restocked
            FROM products p
            LEFT JOIN stock s ON p.product_id = s.product_id
            WHERE p.salon_id = ?
        ";

        $params = [$salonId];

        if ($category) {
            $sql .= " AND p.category = ?";
            $params[] = $category;
        }

        $sql .= " ORDER BY p.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $products
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | PRODUCTS - VIEW PRODUCT DETAILS (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function viewProduct($productId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT p.*, s.current_quantity, s.minimum_quantity, s.maximum_quantity, s.last_restocked
            FROM products p
            LEFT JOIN stock s ON p.product_id = s.product_id
            WHERE p.product_id = ? AND p.salon_id = ?
        ");

        $stmt->execute([$productId, $salonId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            Response::json(["status" => "error", "message" => "Product not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $product
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK - UPDATE STOCK LEVELS (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function updateStock($productId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify product belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM products WHERE product_id = ? AND salon_id = ?");
        $stmt->execute([$productId, $salonId]);
        $product = $stmt->fetch();

        if (!$product) {
            Response::json(["status" => "error", "message" => "Product not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $currentQty = $data['current_quantity'] ?? null;
        $minQty = $data['minimum_quantity'] ?? null;
        $maxQty = $data['maximum_quantity'] ?? null;

        if ($currentQty === null && $minQty === null && $maxQty === null) {
            Response::json(["status" => "error", "message" => "At least one quantity field is required"], 400);
        }

        try {
            $updates = [];
            $values = [];

            if ($currentQty !== null) {
                $updates[] = "current_quantity = ?";
                $values[] = $currentQty;
            }
            if ($minQty !== null) {
                $updates[] = "minimum_quantity = ?";
                $values[] = $minQty;
            }
            if ($maxQty !== null) {
                $updates[] = "maximum_quantity = ?";
                $values[] = $maxQty;
            }

            $updates[] = "last_restocked = NOW()";
            $values[] = $productId;
            $values[] = $salonId;

            $sql = "UPDATE stock SET " . implode(', ', $updates) . ", updated_at = NOW()
                    WHERE product_id = ? AND salon_id = ?";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($values);

            Response::json([
                "status" => "success"
            ]);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to update stock: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK - GET LOW STOCK ALERTS (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function getLowStockAlerts()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT p.product_id, p.product_name, p.brand, p.category,
                   s.current_quantity, s.minimum_quantity, s.maximum_quantity,
                   (s.minimum_quantity - s.current_quantity) AS shortage
            FROM products p
            INNER JOIN stock s ON p.product_id = s.product_id
            WHERE p.salon_id = ? AND s.current_quantity <= s.minimum_quantity
            ORDER BY shortage DESC
        ");

        $stmt->execute([$salonId]);
        $lowStockItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $lowStockItems,
                "count" => count($lowStockItems)
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | STOCK - GET ALL STOCK LEVELS (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function getAllStockLevels()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT p.product_id, p.product_name, p.brand, p.category,
                   s.stock_id, s.current_quantity, s.minimum_quantity, s.maximum_quantity,
                   s.last_restocked,
                   CASE 
                       WHEN s.current_quantity <= s.minimum_quantity THEN 'LOW'
                       WHEN s.current_quantity >= s.maximum_quantity THEN 'OVERSTOCKED'
                       ELSE 'OK'
                   END AS stock_status
            FROM products p
            INNER JOIN stock s ON p.product_id = s.product_id
            WHERE p.salon_id = ?
            ORDER BY p.product_name ASC
        ");

        $stmt->execute([$salonId]);
        $stockLevels = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $stockLevels
            ]
        ]);
    }
}

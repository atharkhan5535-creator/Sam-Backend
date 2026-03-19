<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class ServiceController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE SERVICE (ADMIN only)
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

        $serviceName = trim($data['service_name'] ?? '');
        $description = trim($data['description'] ?? '');
        $price = $data['price'] ?? null;
        $duration = $data['duration'] ?? null;
        $imageUrl = trim($data['image_url'] ?? '');
        $status = $data['status'] ?? 'ACTIVE';

        // Validation
        if (!$serviceName) {
            Response::json(["status" => "error", "message" => "Service name is required"], 400);
        }

        if ($price === null || $price < 0) {
            Response::json(["status" => "error", "message" => "Valid price is required"], 400);
        }

        if ($duration === null || $duration <= 0) {
            Response::json(["status" => "error", "message" => "Valid duration is required"], 400);
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO services
                (salon_id, service_name, description, price, duration, image_url, status, created_at, updated_at, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
            ");

            $stmt->execute([
                $salonId,
                $serviceName,
                $description ?: null,
                $price,
                $duration,
                $imageUrl ?: null,
                $status,
                $data['category'] ?? null
            ]);

            Response::json([
                "status" => "success",
                "data" => [
                    "service_id" => $this->db->lastInsertId()
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to create service: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ UPDATE SERVICE (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function update($serviceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify service belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM services WHERE service_id = ? AND salon_id = ?");
        $stmt->execute([$serviceId, $salonId]);
        $service = $stmt->fetch();

        if (!$service) {
            Response::json(["status" => "error", "message" => "Service not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $allowedFields = ['service_name', 'description', 'price', 'duration', 'image_url', 'category'];
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

        $values[] = $serviceId;
        $values[] = $salonId;

        $sql = "UPDATE services SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE service_id = ? AND salon_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ ACTIVATE/DEACTIVATE SERVICE (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function toggleStatus($serviceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $status = $data['status'] ?? null;

        if (!in_array($status, ['ACTIVE', 'INACTIVE'])) {
            Response::json(["status" => "error", "message" => "Status must be ACTIVE or INACTIVE"], 400);
        }

        $stmt = $this->db->prepare("
            UPDATE services
            SET status = ?, updated_at = NOW()
            WHERE service_id = ? AND salon_id = ?
        ");

        $stmt->execute([$status, $serviceId, $salonId]);

        if ($stmt->rowCount() === 0) {
            Response::json(["status" => "error", "message" => "Service not found"], 404);
        }

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ LIST SERVICES (ADMIN, STAFF, CUSTOMER)
    | - ADMIN/STAFF: Can view all services (active & inactive)
    | - CUSTOMER: Can only view active services
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? ($_GET['salon_id'] ?? null);
        $userRole = $auth['role'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "salon id required"], 400);
        }

        // Build query based on user role
        if ($userRole === 'CUSTOMER') {
            // CUSTOMERS can only see ACTIVE services
            $status = 'ACTIVE';
            $stmt = $this->db->prepare("
                SELECT service_id, service_name, description, price, duration, image_url, status, created_at, category
                FROM services
                WHERE salon_id = ? AND status = ?
                ORDER BY created_at DESC
            ");
            $stmt->execute([$salonId, $status]);
        } else {
            // ADMIN/STAFF can see all services (active & inactive)
            // Optional: Can filter by status via query param if needed
            $statusFilter = $_GET['status'] ?? null;
            
            if ($statusFilter && in_array($statusFilter, ['ACTIVE', 'INACTIVE'])) {
                $stmt = $this->db->prepare("
                    SELECT service_id, service_name, description, price, duration, image_url, status, created_at, category
                    FROM services
                    WHERE salon_id = ? AND status = ?
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$salonId, $statusFilter]);
            } else {
                $stmt = $this->db->prepare("
                    SELECT service_id, service_name, description, price, duration, image_url, status, created_at, category
                    FROM services
                    WHERE salon_id = ?
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$salonId]);
            }
        }

        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $services
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ VIEW SERVICE DETAILS (ADMIN, STAFF, CUSTOMER)
    |--------------------------------------------------------------------------
    */
    public function show($serviceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT service_id, salon_id, service_name, description, price, duration, image_url, status, created_at, updated_at, category
            FROM services
            WHERE service_id = ? AND salon_id = ?
        ");

        $stmt->execute([$serviceId, $salonId]);
        $service = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$service) {
            Response::json(["status" => "error", "message" => "Service not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $service
        ]);
    }
}

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
        $staffId = $data['staff_id'] ?? null;

        // 1️⃣ Service Name Required
        if (!$serviceName) {
            Response::json(["status" => "error", "message" => "Service name is required"], 400);
        }

        // 2️⃣ Service Name Length Validation (1-100 characters)
        if (strlen($serviceName) < 1 || strlen($serviceName) > 100) {
            Response::json(["status" => "error", "message" => "Service name must be between 1 and 100 characters"], 400);
        }

        // 3️⃣ Price Validation (>= 0 and <= 1,000,000)
        if ($price === null || $price < 0 || $price > 1000000) {
            Response::json(["status" => "error", "message" => "Valid price is required (0 to 1,000,000)"], 400);
        }

        // 4️⃣ Duration Validation (1-1440 minutes = 24 hours max)
        if ($duration === null || $duration <= 0 || $duration > 1440) {
            Response::json(["status" => "error", "message" => "Valid duration is required (1 to 1440 minutes)"], 400);
        }

        // 5️⃣ Image URL Format Validation (if provided)
        if ($imageUrl && !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
            Response::json(["status" => "error", "message" => "Invalid image URL format"], 400);
        }

        // 6️⃣ Staff ID Validation (if provided, must belong to same salon)
        if ($staffId) {
            $stmt = $this->db->prepare("
                SELECT staff_id FROM staff_info
                WHERE staff_id = ? AND salon_id = ?
            ");
            $stmt->execute([$staffId, $salonId]);
            if (!$stmt->fetch()) {
                Response::json(["status" => "error", "message" => "Invalid staff_id: Staff must belong to this salon"], 400);
            }
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO services
                (salon_id, staff_id, service_name, description, price, duration, image_url, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $salonId,
                $staffId,
                $serviceName,
                $description ?: null,
                $price,
                $duration,
                $imageUrl ?: null,
                $status
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

        $allowedFields = ['service_name', 'description', 'price', 'duration', 'image_url'];
        $updates = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        // Handle staff_id separately with validation
        if (isset($data['staff_id'])) {
            $staffId = $data['staff_id'];
            if ($staffId) {
                // Validate staff exists and belongs to same salon
                $stmt = $this->db->prepare("
                    SELECT staff_id FROM staff_info
                    WHERE staff_id = ? AND salon_id = ?
                ");
                $stmt->execute([$staffId, $salonId]);
                if (!$stmt->fetch()) {
                    Response::json(["status" => "error", "message" => "Invalid staff_id: Staff must belong to this salon"], 400);
                }
            }
            $updates[] = "staff_id = ?";
            $values[] = $staffId;
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
    | 4️⃣ LIST SERVICES (PUBLIC, ADMIN, STAFF, CUSTOMER)
    | - PUBLIC: Can only view ACTIVE services (landing page)
    | - CUSTOMER: Can only view ACTIVE services
    | - ADMIN/STAFF: Can view all services (active & inactive)
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        
        // Get salon_id from auth token OR query parameter (for public access)
        $salonId = $auth['salon_id'] ?? ($_GET['salon_id'] ?? null);
        $userRole = $auth['role'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Salon ID required (pass as query parameter ?salon_id=X)"], 400);
        }

        // Build query based on user role
        if (!$auth) {
            // PUBLIC (No authentication) - ACTIVE services only
            $stmt = $this->db->prepare("
                SELECT service_id, salon_id, staff_id, service_name, description, price, duration, image_url, status, created_at
                FROM services
                WHERE salon_id = ? AND status = 'ACTIVE'
                ORDER BY created_at DESC
            ");
            $stmt->execute([$salonId]);
        } elseif ($userRole === 'CUSTOMER') {
            // CUSTOMER - ACTIVE services only
            $stmt = $this->db->prepare("
                SELECT service_id, salon_id, staff_id, service_name, description, price, duration, image_url, status, created_at
                FROM services
                WHERE salon_id = ? AND status = 'ACTIVE'
                ORDER BY created_at DESC
            ");
            $stmt->execute([$salonId]);
        } else {
            // ADMIN/STAFF - Can see all services (active & inactive)
            // Optional: Can filter by status via query param if needed
            $statusFilter = $_GET['status'] ?? null;

            if ($statusFilter && in_array($statusFilter, ['ACTIVE', 'INACTIVE'])) {
                $stmt = $this->db->prepare("
                    SELECT service_id, salon_id, staff_id, service_name, description, price, duration, image_url, status, created_at
                    FROM services
                    WHERE salon_id = ? AND status = ?
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$salonId, $statusFilter]);
            } else {
                $stmt = $this->db->prepare("
                    SELECT service_id, salon_id, staff_id, service_name, description, price, duration, image_url, status, created_at
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
    | 5️⃣ VIEW SERVICE DETAILS (PUBLIC, ADMIN, STAFF, CUSTOMER)
    | - PUBLIC: Can only view ACTIVE services (landing page)
    | - CUSTOMER: Can only view ACTIVE services
    | - ADMIN/STAFF: Can view all services (active & inactive)
    |--------------------------------------------------------------------------
    */
    public function show($serviceId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        
        // Get salon_id from auth token OR query parameter (for public access)
        $salonId = $auth['salon_id'] ?? ($_GET['salon_id'] ?? null);

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Salon ID required (pass as query parameter ?salon_id=X)"], 400);
        }

        // Build query based on authentication status
        if (!$auth) {
            // PUBLIC (No authentication) - ACTIVE services only
            $stmt = $this->db->prepare("
                SELECT service_id, salon_id, staff_id, service_name, description, price, duration, image_url, status, created_at, updated_at
                FROM services
                WHERE service_id = ? AND salon_id = ? AND status = 'ACTIVE'
            ");
            $stmt->execute([$serviceId, $salonId]);
        } else {
            // AUTHENTICATED USERS - Check based on role
            $stmt = $this->db->prepare("
                SELECT service_id, salon_id, staff_id, service_name, description, price, duration, image_url, status, created_at, updated_at
                FROM services
                WHERE service_id = ? AND salon_id = ?
            ");
            $stmt->execute([$serviceId, $salonId]);
        }

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

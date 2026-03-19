<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class PackageController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE PACKAGE (ADMIN only) - WITH service mapping
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

        $packageName = trim($data['package_name'] ?? '');
        $description = trim($data['description'] ?? '');
        $totalPrice = $data['total_price'] ?? null;
        $validityDays = $data['validity_days'] ?? null;
        $imageUrl = trim($data['image_url'] ?? '');
        $status = $data['status'] ?? 'ACTIVE';
        $serviceIds = $data['service_ids'] ?? [];

        // 1️⃣ Package Name Required
        if (!$packageName) {
            Response::json(["status" => "error", "message" => "Package name is required"], 400);
        }

        // 2️⃣ Package Name Length Validation (1-100 characters)
        if (strlen($packageName) < 1 || strlen($packageName) > 100) {
            Response::json(["status" => "error", "message" => "Package name must be between 1 and 100 characters"], 400);
        }

        // 3️⃣ Total Price Validation (>= 0 and <= 1,000,000)
        if ($totalPrice === null || $totalPrice < 0 || $totalPrice > 1000000) {
            Response::json(["status" => "error", "message" => "Valid total price is required (0 to 1,000,000)"], 400);
        }

        // 4️⃣ Validity Days Validation (1-365 days)
        if ($validityDays !== null && ($validityDays <= 0 || $validityDays > 365)) {
            Response::json(["status" => "error", "message" => "Validity days must be between 1 and 365"], 400);
        }

        // 5️⃣ Service IDs Array Validation
        if (empty($serviceIds) || !is_array($serviceIds)) {
            Response::json(["status" => "error", "message" => "At least one service is required"], 400);
        }

        // 6️⃣ Duplicate Service IDs Check
        if (count($serviceIds) !== count(array_unique($serviceIds))) {
            Response::json(["status" => "error", "message" => "Duplicate service IDs found"], 400);
        }

        // 7️⃣ Image URL Format Validation (if provided)
        if ($imageUrl && !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
            Response::json(["status" => "error", "message" => "Invalid image URL format"], 400);
        }

        try {
            $this->db->beginTransaction();

            // Insert into packages
            $stmt = $this->db->prepare("
                INSERT INTO packages
                (salon_id, package_name, description, total_price, validity_days, image_url, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $salonId,
                $packageName,
                $description ?: null,
                $totalPrice,
                $validityDays,
                $imageUrl ?: null,
                $status
            ]);

            $packageId = $this->db->lastInsertId();

            // Verify all services belong to this salon
            $placeholders = implode(',', array_fill(0, count($serviceIds), '?'));
            $verifyStmt = $this->db->prepare("
                SELECT COUNT(*) FROM services 
                WHERE service_id IN ($placeholders) AND salon_id = ?
            ");
            $verifyParams = array_merge($serviceIds, [$salonId]);
            $verifyStmt->execute($verifyParams);
            $serviceCount = $verifyStmt->fetchColumn();

            if ($serviceCount !== count($serviceIds)) {
                throw new Exception("One or more services do not belong to this salon");
            }

            // Insert into package_services
            $insertStmt = $this->db->prepare("
                INSERT INTO package_services (package_id, service_id, salon_id, created_at)
                VALUES (?, ?, ?, NOW())
            ");

            foreach ($serviceIds as $serviceId) {
                $insertStmt->execute([$packageId, $serviceId, $salonId]);
            }

            $this->db->commit();

            Response::json([
                "status" => "success",
                "data" => [
                    "package_id" => $packageId
                ]
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to create package: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ UPDATE PACKAGE (ADMIN only) - WITH service mapping
    |--------------------------------------------------------------------------
    */
    public function update($packageId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify package belongs to salon
        $stmt = $this->db->prepare("SELECT * FROM packages WHERE package_id = ? AND salon_id = ?");
        $stmt->execute([$packageId, $salonId]);
        $package = $stmt->fetch();

        if (!$package) {
            Response::json(["status" => "error", "message" => "Package not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $allowedFields = ['package_name', 'description', 'total_price', 'validity_days', 'image_url'];
        $updates = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        $hasServiceUpdate = isset($data['service_ids']) && is_array($data['service_ids']);

        if (empty($updates) && !$hasServiceUpdate) {
            Response::json(["status" => "error", "message" => "No valid fields to update"], 400);
        }

        try {
            $this->db->beginTransaction();

            // Update package details
            if (!empty($updates)) {
                $values[] = $packageId;
                $values[] = $salonId;

                $sql = "UPDATE packages SET " . implode(', ', $updates) . ", updated_at = NOW()
                        WHERE package_id = ? AND salon_id = ?";

                $stmt = $this->db->prepare($sql);
                $stmt->execute($values);
            }

            // Update service mappings if provided
            if ($hasServiceUpdate) {
                $serviceIds = $data['service_ids'];

                if (empty($serviceIds)) {
                    throw new Exception("At least one service is required");
                }

                // Delete existing mappings
                $deleteStmt = $this->db->prepare("DELETE FROM package_services WHERE package_id = ?");
                $deleteStmt->execute([$packageId]);

                // Verify all services belong to this salon
                $placeholders = implode(',', array_fill(0, count($serviceIds), '?'));
                $verifyStmt = $this->db->prepare("
                    SELECT COUNT(*) FROM services 
                    WHERE service_id IN ($placeholders) AND salon_id = ?
                ");
                $verifyParams = array_merge($serviceIds, [$salonId]);
                $verifyStmt->execute($verifyParams);
                $serviceCount = $verifyStmt->fetchColumn();

                if ($serviceCount !== count($serviceIds)) {
                    throw new Exception("One or more services do not belong to this salon");
                }

                // Insert new mappings
                $insertStmt = $this->db->prepare("
                    INSERT INTO package_services (package_id, service_id, salon_id, created_at)
                    VALUES (?, ?, ?, NOW())
                ");

                foreach ($serviceIds as $serviceId) {
                    $insertStmt->execute([$packageId, $serviceId, $salonId]);
                }
            }

            $this->db->commit();

            Response::json([
                "status" => "success"
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to update package: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ ACTIVATE/DEACTIVATE PACKAGE (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function toggleStatus($packageId)
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
            UPDATE packages
            SET status = ?, updated_at = NOW()
            WHERE package_id = ? AND salon_id = ?
        ");

        $stmt->execute([$status, $packageId, $salonId]);

        if ($stmt->rowCount() === 0) {
            Response::json(["status" => "error", "message" => "Package not found"], 404);
        }

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ LIST PACKAGES (PUBLIC, ADMIN, STAFF, CUSTOMER)
    | - PUBLIC: Can only view ACTIVE packages (landing page)
    | - CUSTOMER: Can only view ACTIVE packages
    | - ADMIN/STAFF: Can view all packages (active & inactive)
    | - Query param: ?include=services to include services array for each package
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $auth = $GLOBALS['auth_user'] ?? null;

        // Get salon_id from auth token OR query parameter (for public access)
        $salonId = $auth['salon_id'] ?? ($_GET['salon_id'] ?? null);
        $userRole = $auth['role'] ?? null;
        $includeServices = isset($_GET['include']) && $_GET['include'] === 'services';

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Salon ID required (pass as query parameter ?salon_id=X)"], 400);
        }

        // Build query based on user role
        if (!$auth) {
            // PUBLIC (No authentication) - ACTIVE packages only
            $stmt = $this->db->prepare("
                SELECT package_id, salon_id, package_name, description, total_price, validity_days, image_url, status, created_at
                FROM packages
                WHERE salon_id = ? AND status = 'ACTIVE'
                ORDER BY created_at DESC
            ");
            $stmt->execute([$salonId]);
        } elseif ($userRole === 'CUSTOMER') {
            // CUSTOMER - ACTIVE packages only
            $stmt = $this->db->prepare("
                SELECT package_id, salon_id, package_name, description, total_price, validity_days, image_url, status, created_at
                FROM packages
                WHERE salon_id = ? AND status = 'ACTIVE'
                ORDER BY created_at DESC
            ");
            $stmt->execute([$salonId]);
        } else {
            // ADMIN/STAFF - Can see all packages (active & inactive)
            // Optional: Can filter by status via query param if needed
            $statusFilter = $_GET['status'] ?? null;

            if ($statusFilter && in_array($statusFilter, ['ACTIVE', 'INACTIVE'])) {
                $stmt = $this->db->prepare("
                    SELECT package_id, salon_id, package_name, description, total_price, validity_days, image_url, status, created_at
                    FROM packages
                    WHERE salon_id = ? AND status = ?
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$salonId, $statusFilter]);
            } else {
                $stmt = $this->db->prepare("
                    SELECT package_id, salon_id, package_name, description, total_price, validity_days, image_url, status, created_at
                    FROM packages
                    WHERE salon_id = ?
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$salonId]);
            }
        }

        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Optionally include services for each package
        if ($includeServices) {
            $stmt = $this->db->prepare("
                SELECT ps.package_id, s.service_id, s.service_name, s.description, s.price, s.duration
                FROM services s
                INNER JOIN package_services ps ON s.service_id = ps.service_id
                WHERE ps.package_id = ? AND ps.salon_id = ?
            ");

            foreach ($packages as &$package) {
                $stmt->execute([$package['package_id'], $salonId]);
                $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $package['services'] = $services;
            }
        }

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $packages
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ VIEW PACKAGE DETAILS (PUBLIC, ADMIN, STAFF, CUSTOMER)
    | - PUBLIC: Can only view ACTIVE packages (landing page)
    | - CUSTOMER: Can only view ACTIVE packages
    | - ADMIN/STAFF: Can view all packages (active & inactive)
    |--------------------------------------------------------------------------
    */
    public function show($packageId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        
        // Get salon_id from auth token OR query parameter (for public access)
        $salonId = $auth['salon_id'] ?? ($_GET['salon_id'] ?? null);

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Salon ID required (pass as query parameter ?salon_id=X)"], 400);
        }

        // Build query based on authentication status
        if (!$auth) {
            // PUBLIC (No authentication) - ACTIVE packages only
            $stmt = $this->db->prepare("
                SELECT package_id, salon_id, package_name, description, total_price, validity_days, image_url, status, created_at, updated_at
                FROM packages
                WHERE package_id = ? AND salon_id = ? AND status = 'ACTIVE'
            ");
            $stmt->execute([$packageId, $salonId]);
        } else {
            // AUTHENTICATED USERS - Check based on role
            $stmt = $this->db->prepare("
                SELECT package_id, salon_id, package_name, description, total_price, validity_days, image_url, status, created_at, updated_at
                FROM packages
                WHERE package_id = ? AND salon_id = ?
            ");
            $stmt->execute([$packageId, $salonId]);
        }

        $package = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$package) {
            Response::json(["status" => "error", "message" => "Package not found"], 404);
        }

        // Get associated services (only for ACTIVE packages or authenticated users)
        if ($auth || $package['status'] === 'ACTIVE') {
            $stmt = $this->db->prepare("
                SELECT s.service_id, s.service_name, s.description, s.price, s.duration
                FROM services s
                INNER JOIN package_services ps ON s.service_id = ps.service_id
                WHERE ps.package_id = ? AND ps.salon_id = ?
            ");

            $stmt->execute([$packageId, $salonId]);
            $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $package['services'] = $services;
        }

        Response::json([
            "status" => "success",
            "data" => $package
        ]);
    }
}

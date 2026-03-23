<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';
require_once __DIR__ . '/../../helpers/PasswordHelper.php';

class SalonController
{
    private $db;
    private $uploadDir;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        // Set upload directory for salon logos
        $this->uploadDir = __DIR__ . '/../../public/uploads/salons/';

        // Create upload directory if it doesn't exist
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0777, true);
        }
    }

    /**
     * Handle file upload for salon logos
     */
    public function uploadLogo()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $userRole = $auth['role'] ?? null;

        // Only SUPER_ADMIN can upload salon logos
        if ($userRole !== 'SUPER_ADMIN') {
            Response::json(["status" => "error", "message" => "Unauthorized"], 403);
        }

        // Check if file was uploaded
        if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
            Response::json(["status" => "error", "message" => "No image file provided"], 400);
        }

        $file = $_FILES['image'];

        // Validate upload error
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::json(["status" => "error", "message" => "File upload error: " . $this->getUploadErrorMessage($file['error'])], 400);
        }

        // Validate file size (max 2MB)
        $maxSize = 2 * 1024 * 1024; // 2MB
        if ($file['size'] > $maxSize) {
            Response::json(["status" => "error", "message" => "File size exceeds 2MB limit"], 400);
        }

        // Validate file type using multiple methods
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        // Get file extension
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        // Allowed MIME types
        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

        // Allowed extensions
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

        // Validate using both MIME type and extension
        $isValidMimeType = in_array($mimeType, $allowedMimeTypes);
        $isValidExtension = in_array($extension, $allowedExtensions);

        if (!$isValidMimeType && !$isValidExtension) {
            Response::json([
                "status" => "error",
                "message" => "Invalid file type. Only JPG, PNG, GIF, WEBP, and SVG are allowed. Detected: {$mimeType}"
            ], 400);
        }

        try {
            // Generate unique filename
            $filename = 'salon_logo_' . uniqid() . '_' . time() . '.' . $extension;
            $filepath = $this->uploadDir . $filename;

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                Response::json(["status" => "error", "message" => "Failed to save uploaded file. Check server permissions."], 500);
            }

            // Return the URL path (relative to public folder)
            $imageUrl = '/uploads/salons/' . $filename;

            Response::json([
                "status" => "success",
                "message" => "Logo uploaded successfully",
                "data" => [
                    "image_url" => $imageUrl,
                    "file_name" => $filename,
                    "file_size" => $file['size'],
                    "mime_type" => $mimeType
                ]
            ]);

        } catch (Exception $e) {
            Response::json(["status" => "error", "message" => "Upload failed: " . $e->getMessage()], 500);
        }
    }

    /**
     * Get user-friendly upload error message
     */
    private function getUploadErrorMessage($errorCode)
    {
        $messages = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds server limit',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form limit',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Server temporary folder missing',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'Upload stopped by extension'
        ];
        return $messages[$errorCode] ?? 'Unknown upload error';
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ CREATE SALON (SUPER_ADMIN only)
    | Creates salon and auto-generates admin user credentials
    |--------------------------------------------------------------------------
    */
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $salonName = trim($data['salon_name'] ?? '');
        $salonOwnerName = trim($data['salon_ownername'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $gstNum = trim($data['gst_num'] ?? '');
        $address = trim($data['address'] ?? '');
        $city = trim($data['city'] ?? '');
        $state = trim($data['state'] ?? '');
        $country = trim($data['country'] ?? 'India');
        $salonLogo = trim($data['salon_logo'] ?? '');
        $status = $data['status'] ?? 1;

        // Optional admin user fields
        $adminUsername = trim($data['admin_username'] ?? '');
        $adminEmail = trim($data['admin_email'] ?? '');
        $adminPassword = $data['admin_password'] ?? null;

        // Validation
        if (!$salonName || !$salonOwnerName || !$email || !$phone || !$address || !$city || !$state) {
            Response::json(["status" => "error", "message" => "Salon name, owner name, email, phone, address, city, and state are required"], 400);
        }

        // Email validation
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(["status" => "error", "message" => "Invalid email format"], 400);
        }

        // Phone validation (10 digit Indian)
        if (!preg_match("/^[6-9][0-9]{9}$/", $phone)) {
            Response::json(["status" => "error", "message" => "Invalid phone number (10 digit Indian format required)"], 400);
        }

        // GST validation (Indian format) - optional field
        if ($gstNum && !preg_match("/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/", strtoupper($gstNum))) {
            Response::json(["status" => "error", "message" => "Invalid GST number format"], 400);
        }

        // Check duplicate salon email
        $stmt = $this->db->prepare("SELECT salon_id FROM salons WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Salon email already registered"], 409);
        }

        // Check duplicate GST (if provided)
        if ($gstNum) {
            $stmt = $this->db->prepare("SELECT salon_id FROM salons WHERE gst_num = ?");
            $stmt->execute([strtoupper($gstNum)]);
            if ($stmt->fetch()) {
                Response::json(["status" => "error", "message" => "GST number already registered"], 409);
            }
        }

        // If admin_email provided, check duplicate in users table
        if ($adminEmail) {
            $stmt = $this->db->prepare("SELECT user_id FROM users WHERE email = ?");
            $stmt->execute([$adminEmail]);
            if ($stmt->fetch()) {
                Response::json(["status" => "error", "message" => "Admin email already registered"], 409);
            }
        }

        try {
            $this->db->beginTransaction();

            // 1. Create salon
            $stmt = $this->db->prepare("
                INSERT INTO salons
                (salon_name, salon_ownername, email, phone, gst_num, address, city, state, country, salon_logo, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $salonName,
                $salonOwnerName,
                $email,
                $phone,
                $gstNum ? strtoupper($gstNum) : null,
                $address,
                $city,
                $state,
                $country,
                $salonLogo ?: null,
                $status
            ]);

            $salonId = $this->db->lastInsertId();

            // 2. Auto-create admin user for the salon
            $generatedPassword = false;
            
            // Use provided admin details or generate defaults
            if (!$adminUsername) {
                $adminUsername = 'admin_' . strtolower(str_replace(' ', '_', $salonName));
            }
            if (!$adminEmail) {
                $adminEmail = 'admin.' . strtolower(str_replace(' ', '', $salonName)) . '@salon.com';
            }
            if (!$adminPassword) {
                $adminPassword = bin2hex(random_bytes(8)); // Generate 16-char random password
                $generatedPassword = true;
            }

            // Check if username already exists
            $stmt = $this->db->prepare("SELECT user_id FROM users WHERE username = ?");
            $stmt->execute([$adminUsername]);
            if ($stmt->fetch()) {
                $adminUsername .= '_' . $salonId;
            }

            $passwordHash = PasswordHelper::hash($adminPassword);

            $stmt = $this->db->prepare("
                INSERT INTO users
                (salon_id, username, role, email, password_hash, status)
                VALUES (?, ?, 'ADMIN', ?, ?, 'ACTIVE')
            ");

            $stmt->execute([
                $salonId,
                $adminUsername,
                $adminEmail,
                $passwordHash
            ]);

            $userId = $this->db->lastInsertId();

            $this->db->commit();

            $responseData = [
                "salon_id" => $salonId,
                "admin_user_id" => $userId,
                "admin_username" => $adminUsername,
                "admin_email" => $adminEmail
            ];

            // Include generated password only if auto-generated
            if ($generatedPassword) {
                $responseData["generated_password"] = $adminPassword;
                $responseData["message"] = "Admin password auto-generated. Please share with salon admin securely.";
            }

            Response::json([
                "status" => "success",
                "data" => $responseData
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json([
                "status" => "error",
                "message" => "Failed to create salon: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ UPDATE SALON (SUPER_ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function update($salonId)
    {
        // Verify salon exists
        $stmt = $this->db->prepare("SELECT * FROM salons WHERE salon_id = ?");
        $stmt->execute([$salonId]);
        $salon = $stmt->fetch();

        if (!$salon) {
            Response::json(["status" => "error", "message" => "Salon not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $allowedFields = [
            'salon_name', 'salon_ownername', 'email', 'phone', 'gst_num',
            'address', 'city', 'state', 'country', 'salon_logo'
        ];

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

        // Check duplicate email (exclude current salon)
        if (isset($data['email']) && $data['email'] !== $salon['email']) {
            $stmt = $this->db->prepare("SELECT salon_id FROM salons WHERE email = ? AND salon_id != ?");
            $stmt->execute([$data['email'], $salonId]);
            if ($stmt->fetch()) {
                Response::json(["status" => "error", "message" => "Email already registered"], 409);
            }
        }

        // Check duplicate GST (exclude current salon)
        if (isset($data['gst_num']) && strtoupper($data['gst_num']) !== $salon['gst_num']) {
            $stmt = $this->db->prepare("SELECT salon_id FROM salons WHERE gst_num = ? AND salon_id != ?");
            $stmt->execute([strtoupper($data['gst_num']), $salonId]);
            if ($stmt->fetch()) {
                Response::json(["status" => "error", "message" => "GST number already registered"], 409);
            }
        }

        $values[] = $salonId;

        $sql = "UPDATE salons SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE salon_id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ TOGGLE SALON STATUS (SUPER_ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function toggleStatus($salonId)
    {
        // Verify salon exists
        $stmt = $this->db->prepare("SELECT * FROM salons WHERE salon_id = ?");
        $stmt->execute([$salonId]);
        $salon = $stmt->fetch();

        if (!$salon) {
            Response::json(["status" => "error", "message" => "Salon not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $status = $data['status'] ?? null;

        if ($status === null || !in_array($status, [0, 1])) {
            Response::json(["status" => "error", "message" => "Status must be 0 (inactive) or 1 (active)"], 400);
        }

        $stmt = $this->db->prepare("
            UPDATE salons
            SET status = ?, updated_at = NOW()
            WHERE salon_id = ?
        ");

        $stmt->execute([$status, $salonId]);

        Response::json([
            "status" => "success"
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ LIST SALONS (SUPER_ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        $status = $_GET['status'] ?? null;

        $sql = "SELECT * FROM salons WHERE 1=1";
        $params = [];

        if ($status !== null) {
            $sql .= " AND status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $salons = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $salons,
                "total" => count($salons)
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ VIEW SALON DETAILS (SUPER_ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function show($salonId)
    {
        $stmt = $this->db->prepare("SELECT * FROM salons WHERE salon_id = ?");
        $stmt->execute([$salonId]);
        $salon = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$salon) {
            Response::json(["status" => "error", "message" => "Salon not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $salon
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 6️⃣ GET SALON INFO (PUBLIC) - For customer landing pages
    |--------------------------------------------------------------------------
    */
    public function getSalonInfo()
    {
        $salonId = $_GET['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Salon ID required"], 400);
            return;
        }

        $stmt = $this->db->prepare("
            SELECT salon_id, salon_name, salon_ownername, email, phone, 
                   address, city, state, country, salon_logo, status
            FROM salons
            WHERE salon_id = ? AND status = 1
        ");
        $stmt->execute([$salonId]);
        $salon = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$salon) {
            Response::json(["status" => "error", "message" => "Salon not found or inactive"], 404);
            return;
        }

        Response::json([
            "status" => "success",
            "data" => $salon
        ]);
    }
}

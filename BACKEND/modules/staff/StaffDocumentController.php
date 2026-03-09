<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class StaffDocumentController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ ADD STAFF DOCUMENT (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function create($staffId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify staff belongs to salon
        $stmt = $this->db->prepare("SELECT staff_id FROM staff_info WHERE staff_id = ? AND salon_id = ?");
        $stmt->execute([$staffId, $salonId]);
        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Staff not found"], 404);
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $docType = $data['doc_type'] ?? null;
        $documentName = trim($data['document_name'] ?? '');
        $filePath = trim($data['file_path'] ?? '');
        $fileSize = $data['file_size'] ?? null;
        $expiryDate = $data['expiry_date'] ?? null;

        // Validation
        $validDocTypes = ['CERTIFICATION', 'ID_PROOF', 'CONTRACT', 'RESUME', 'OTHER'];
        if (!$docType || !in_array($docType, $validDocTypes)) {
            Response::json(["status" => "error", "message" => "Valid document type is required"], 400);
        }

        if (!$filePath) {
            Response::json(["status" => "error", "message" => "File path is required"], 400);
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO staff_documents
                (staff_id, doc_type, document_name, file_path, file_size, expiry_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $stmt->execute([
                $staffId,
                $docType,
                $documentName ?: null,
                $filePath,
                $fileSize ?: null,
                $expiryDate ?: null
            ]);

            Response::json([
                "status" => "success",
                "data" => [
                    "doc_id" => $this->db->lastInsertId(),
                    "staff_id" => $staffId,
                    "doc_type" => $docType,
                    "file_path" => $filePath,
                    "created_at" => date('Y-m-d H:i:s')
                ]
            ], 201);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to upload document: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ LIST STAFF DOCUMENTS (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function index($staffId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Verify staff belongs to salon
        $stmt = $this->db->prepare("SELECT staff_id FROM staff_info WHERE staff_id = ? AND salon_id = ?");
        $stmt->execute([$staffId, $salonId]);
        if (!$stmt->fetch()) {
            Response::json(["status" => "error", "message" => "Staff not found"], 404);
        }

        $stmt = $this->db->prepare("
            SELECT doc_id, staff_id, doc_type, document_name, file_path, file_size, uploaded_at, expiry_date
            FROM staff_documents
            WHERE staff_id = ?
            ORDER BY uploaded_at DESC
        ");

        $stmt->execute([$staffId]);
        $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "items" => $documents
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ VIEW STAFF DOCUMENT (ADMIN, STAFF)
    |--------------------------------------------------------------------------
    */
    public function show($staffId, $docId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            SELECT doc_id, staff_id, doc_type, document_name, file_path, file_size, uploaded_at, expiry_date
            FROM staff_documents
            WHERE doc_id = ? AND staff_id = ?
        ");

        $stmt->execute([$docId, $staffId]);
        $document = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$document) {
            Response::json(["status" => "error", "message" => "Document not found"], 404);
        }

        Response::json([
            "status" => "success",
            "data" => $document
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ DELETE STAFF DOCUMENT (ADMIN only)
    |--------------------------------------------------------------------------
    */
    public function delete($staffId, $docId)
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $stmt = $this->db->prepare("
            DELETE FROM staff_documents
            WHERE doc_id = ? AND staff_id = ?
        ");

        $stmt->execute([$docId, $staffId]);

        if ($stmt->rowCount() === 0) {
            Response::json(["status" => "error", "message" => "Document not found"], 404);
        }

        Response::json([
            "status" => "success"
        ]);
    }
}

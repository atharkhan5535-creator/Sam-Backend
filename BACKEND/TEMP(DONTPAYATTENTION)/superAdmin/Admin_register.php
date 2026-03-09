<?php

header("Content-Type: application/json");
require 'db.php';

/* ==============================
   GET JSON INPUT
============================== */
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON input"]);
    exit;
}

/* ==============================
   REQUIRED FIELDS
============================== */
$requiredFields = [
    "salon_name",
    "salon_ownername",
    "email",
    "phone",
    "gst_num",
    "address",
    "city",
    "state",
    "password"
];

foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(["error" => "$field is required"]);
        exit;
    }
}

/* ==============================
   SANITIZE INPUT
============================== */
$salon_name = trim($data["salon_name"]);
$salon_ownername = trim($data["salon_ownername"]);
$salon_email = trim($data["email"]);
$phone = trim($data["phone"]);
$gst_num = strtoupper(trim($data["gst_num"]));
$address = trim($data["address"]);
$city = trim($data["city"]);
$state = trim($data["state"]);
$salon_logo = isset($data["salon_logo"]) ? trim($data["salon_logo"]) : null;
$password_raw = $data["password"];

/* ==============================
   VALIDATIONS
============================== */

// Email
if (!filter_var($salon_email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid email format"]);
    exit;
}

// Phone (10 digit Indian)
if (!preg_match("/^[6-9][0-9]{9}$/", $phone)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid phone number"]);
    exit;
}

// Strong password
if (strlen($password_raw) < 6) {
    http_response_code(400);
    echo json_encode(["error" => "Password must be at least 6 characters"]);
    exit;
}

// Proper GST Validation (Indian GST format)
if (!preg_match("/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/", $gst_num)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid GST number format"]);
    exit;
}

$password = password_hash($password_raw, PASSWORD_DEFAULT);

/* ==============================
   DUPLICATE EMAIL CHECK
============================== */
$checkEmail = $conn->prepare("SELECT salon_id FROM salons WHERE email = ?");
if (!$checkEmail) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit;
}

$checkEmail->bind_param("s", $salon_email);
$checkEmail->execute();
$checkEmail->store_result();

if ($checkEmail->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["error" => "Salon email already registered"]);
    exit;
}
$checkEmail->close();

/* ==============================
   DUPLICATE GST CHECK
============================== */
$checkGST = $conn->prepare("SELECT salon_id FROM salons WHERE gst_num = ?");
if (!$checkGST) {
    http_response_code(500);
    echo json_encode(["error" => $conn->error]);
    exit;
}

$checkGST->bind_param("s", $gst_num);
$checkGST->execute();
$checkGST->store_result();

if ($checkGST->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["error" => "GST number already registered"]);
    exit;
}
$checkGST->close();

/* ==============================
   TRANSACTION START
============================== */
$conn->begin_transaction();

try {

    /* ==============================
       INSERT INTO salons
    ============================== */
    $salonStmt = $conn->prepare("
        INSERT INTO salons
        (salon_name, salon_ownername, email, phone, gst_num,
         address, city, state, salon_logo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$salonStmt) {
        throw new Exception($conn->error);
    }

    $salonStmt->bind_param(
        "sssssssss",
        $salon_name,
        $salon_ownername,
        $salon_email,
        $phone,
        $gst_num,
        $address,
        $city,
        $state,
        $salon_logo
    );

    if (!$salonStmt->execute()) {
        throw new Exception($salonStmt->error);
    }

    $salon_id = $conn->insert_id;
    $salonStmt->close();

    /* ==============================
       INSERT ADMIN USER
    ============================== */
    $userStmt = $conn->prepare("
        INSERT INTO users
        (salon_id, username, role, email, password_hash, status)
        VALUES (?, ?, 'ADMIN', ?, ?, 'ACTIVE')
    ");

    if (!$userStmt) {
        throw new Exception($conn->error);
    }

    $userStmt->bind_param(
        "isss",
        $salon_id,
        $salon_ownername,
        $salon_email,
        $password
    );

    if (!$userStmt->execute()) {
        throw new Exception($userStmt->error);
    }

    $userStmt->close();

    $conn->commit();

    http_response_code(201);
    echo json_encode([
        "message" => "Salon and Admin registered successfully",
        "salon_id" => $salon_id
    ]);

} catch (Exception $e) {

    $conn->rollback();

    http_response_code(500);
    echo json_encode([
        "error" => "Registration failed",
        "details" => $e->getMessage()
    ]);
}

$conn->close();
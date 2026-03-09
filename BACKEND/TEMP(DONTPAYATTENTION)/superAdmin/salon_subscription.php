<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

/* =====================================================
   CREATE SUBSCRIPTION + AUTO INVOICE (WITH VALIDATION)
===================================================== */
if ($method === "POST") {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON"]);
        exit;
    }

    if (!isset($data["salon_id"]) || !isset($data["plan_id"])) {
        http_response_code(400);
        echo json_encode(["error" => "salon_id and plan_id required"]);
        exit;
    }

    $salon_id = (int) $data["salon_id"];
    $plan_id = (int) $data["plan_id"];

    if ($salon_id <= 0 || $plan_id <= 0) {
        echo json_encode(["error" => "Invalid ID values"]);
        exit;
    }

    $conn->begin_transaction();

    try {

        /* 1️⃣ CHECK SALON EXISTS */
        $salonCheck = $conn->prepare("SELECT salon_id FROM salons WHERE salon_id = ?");
        $salonCheck->bind_param("i", $salon_id);
        $salonCheck->execute();
        $salonResult = $salonCheck->get_result();

        if ($salonResult->num_rows === 0) {
            throw new Exception("Salon does not exist");
        }
        $salonCheck->close();


        /* 2️⃣ PREVENT MULTIPLE ACTIVE SUBSCRIPTIONS */
        $activeCheck = $conn->prepare("
            SELECT subscription_id 
            FROM salon_subscriptions 
            WHERE salon_id = ? AND status = 'ACTIVE'
        ");
        $activeCheck->bind_param("i", $salon_id);
        $activeCheck->execute();
        $activeResult = $activeCheck->get_result();

        if ($activeResult->num_rows > 0) {
            throw new Exception("Salon already has an ACTIVE subscription");
        }
        $activeCheck->close();


        /* 3️⃣ GET PLAN DETAILS */
        $planStmt = $conn->prepare("
            SELECT duration_days, plan_type, flat_price, status
            FROM subscription_plans
            WHERE plan_id = ?
        ");
        $planStmt->bind_param("i", $plan_id);
        $planStmt->execute();
        $planResult = $planStmt->get_result();

        if ($planResult->num_rows === 0) {
            throw new Exception("Plan does not exist");
        }

        $plan = $planResult->fetch_assoc();

        if ($plan["status"] != 1) {
            throw new Exception("Plan is inactive");
        }

        $duration = (int) $plan["duration_days"];
        $amount = (float) $plan["flat_price"];

        if ($amount <= 0) {
            throw new Exception("Invalid plan pricing");
        }

        $planStmt->close();

        $start_date = date("Y-m-d");
        $end_date = date("Y-m-d", strtotime("+$duration days"));


        /* 4️⃣ CREATE SUBSCRIPTION */
        $subStmt = $conn->prepare("
            INSERT INTO salon_subscriptions
            (salon_id, plan_id, start_date, end_date, status)
            VALUES (?, ?, ?, ?, 'ACTIVE')
        ");
        $subStmt->bind_param("iiss", $salon_id, $plan_id, $start_date, $end_date);

        if (!$subStmt->execute()) {
            throw new Exception($subStmt->error);
        }

        $subscription_id = $conn->insert_id;
        $subStmt->close();


        /* 5️⃣ CREATE INVOICE */
        $tax_rate = 0; // Change to 18 for GST
        $tax_amount = ($amount * $tax_rate) / 100;
        $total = $amount + $tax_amount;

        $invoice_number = "INV-" . time() . "-" . rand(100, 999);
        $invoice_date = date("Y-m-d");
        $due_date = date("Y-m-d", strtotime("+7 days"));

        $invoiceStmt = $conn->prepare("
            INSERT INTO invoice_salon
            (salon_id, subscription_id, invoice_number,
             amount, tax_amount, total_amount,
             payment_status, invoice_date, due_date)
            VALUES (?, ?, ?, ?, ?, ?, 'UNPAID', ?, ?)
        ");

        $invoiceStmt->bind_param(
            "iissddss",
            $salon_id,
            $subscription_id,
            $invoice_number,
            $amount,
            $tax_amount,
            $total,
            $invoice_date,
            $due_date
        );

        if (!$invoiceStmt->execute()) {
            throw new Exception($invoiceStmt->error);
        }

        $invoiceStmt->close();

        $conn->commit();

        echo json_encode([
            "message" => "Subscription & Invoice created successfully",
            "subscription_id" => $subscription_id,
            "invoice_number" => $invoice_number,
            "total_amount" => $total,
            "start_date" => $start_date,
            "end_date" => $end_date
        ]);

    } catch (Exception $e) {

        $conn->rollback();

        http_response_code(400);
        echo json_encode([
            "error" => $e->getMessage()
        ]);
    }
}


/* =====================================================
   UPDATE STATUS WITH VALIDATION
===================================================== */ elseif ($method === "PUT") {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data["subscription_id"]) || !isset($data["status"])) {
        echo json_encode(["error" => "subscription_id and status required"]);
        exit;
    }

    $allowed = ["ACTIVE", "EXPIRED", "CANCELLED"];

    if (!in_array($data["status"], $allowed)) {
        echo json_encode(["error" => "Invalid status"]);
        exit;
    }

    $stmt = $conn->prepare("
        UPDATE salon_subscriptions
        SET status = ?
        WHERE subscription_id = ?
    ");

    $stmt->bind_param("si", $data["status"], $data["subscription_id"]);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Status updated"]);
    } else {
        echo json_encode(["error" => $stmt->error]);
    }

    $stmt->close();
}


/* =====================================================
   SAFE DELETE (BLOCK IF INVOICE PAID)
===================================================== */ elseif ($method === "DELETE") {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data["subscription_id"])) {
        echo json_encode(["error" => "subscription_id required"]);
        exit;
    }

    $sub_id = (int) $data["subscription_id"];

    // check invoice payment
    $check = $conn->prepare("
        SELECT payment_status 
        FROM invoice_salon
        WHERE subscription_id = ?
    ");
    $check->bind_param("i", $sub_id);
    $check->execute();
    $result = $check->get_result();

    if ($row = $result->fetch_assoc()) {
        if ($row["payment_status"] === "PAID") {
            echo json_encode(["error" => "Cannot delete. Invoice already PAID"]);
            exit;
        }
    }

    $stmt = $conn->prepare("
        DELETE FROM salon_subscriptions
        WHERE subscription_id = ?
    ");
    $stmt->bind_param("i", $sub_id);
    $stmt->execute();

    echo json_encode(["message" => "Subscription deleted"]);

    $stmt->close();
}


/* =====================================================
   GET
===================================================== */ elseif ($method === "GET") {

    $result = $conn->query("
        SELECT ss.*, sp.plan_name
        FROM salon_subscriptions ss
        JOIN subscription_plans sp
            ON ss.plan_id = sp.plan_id
        ORDER BY ss.subscription_id DESC
    ");

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
}

$conn->close();
?>
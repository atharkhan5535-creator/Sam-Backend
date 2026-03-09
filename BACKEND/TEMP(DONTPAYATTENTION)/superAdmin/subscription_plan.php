<?php

header("Content-Type: application/json");
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];


//COMMON VALIDATION FUNCTION

function validatePlanData($data, $isUpdate = false)
{

    if ($isUpdate && (!isset($data["plan_id"]) || !is_numeric($data["plan_id"]))) {
        return "Valid plan_id is required";
    }

    if (!isset($data["plan_name"]) || trim($data["plan_name"]) === "") {
        return "Plan name is required";
    }

    if (!isset($data["duration_days"]) || !is_numeric($data["duration_days"]) || $data["duration_days"] <= 0) {
        return "Duration must be greater than 0";
    }

    $allowedTypes = ["flat", "per-appointments", "Percentage-per-appointments"];
    if (!isset($data["plan_type"]) || !in_array($data["plan_type"], $allowedTypes)) {
        return "Invalid plan type";
    }

    if (!isset($data["flat_price"]) || !is_numeric($data["flat_price"]) || $data["flat_price"] < 0) {
        return "Invalid flat price";
    }

    if (!isset($data["per_appointments_price"]) || !is_numeric($data["per_appointments_price"]) || $data["per_appointments_price"] < 0) {
        return "Invalid per appointment price";
    }

    if (!isset($data["percentage_per_appointments"]) || !is_numeric($data["percentage_per_appointments"]) || $data["percentage_per_appointments"] < 0) {
        return "Invalid percentage";
    }

    if (!isset($data["status"]) || !in_array($data["status"], [0, 1])) {
        return "Status must be 0 or 1";
    }

    return null;
}


//   CREATE (POST)

if ($method === "POST") {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON"]);
        exit;
    }

    $error = validatePlanData($data);
    if ($error) {
        http_response_code(400);
        echo json_encode(["error" => $error]);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO subscription_plans
        (plan_name, duration_days, plan_type,
         flat_price, per_appointments_price,
         percentage_per_appointments, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "sissddi",
        $data["plan_name"],
        $data["duration_days"],
        $data["plan_type"],
        $data["flat_price"],
        $data["per_appointments_price"],
        $data["percentage_per_appointments"],
        $data["status"]
    );

    if ($stmt->execute()) {
        echo json_encode([
            "message" => "Plan created successfully",
            "plan_id" => $conn->insert_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
    }

    $stmt->close();
}

//   READ (GET)
elseif ($method === "GET") {

    // Single Plan
    if (isset($_GET["id"])) {

        $stmt = $conn->prepare("
            SELECT * FROM subscription_plans
            WHERE plan_id = ? AND status != 2
        ");

        $stmt->bind_param("i", $_GET["id"]);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Plan not found"]);
        } else {
            echo json_encode($result->fetch_assoc());
        }

        $stmt->close();
    }
    // All Plans (exclude deleted)
    else {
        $result = $conn->query("
            SELECT * FROM subscription_plans
            WHERE status != 2
            ORDER BY plan_id DESC
        ");

        $plans = [];
        while ($row = $result->fetch_assoc()) {
            $plans[] = $row;
        }

        echo json_encode($plans);
    }
}


//   UPDATE (PUT)
elseif ($method === "PUT") {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON"]);
        exit;
    }

    $error = validatePlanData($data, true);
    if ($error) {
        http_response_code(400);
        echo json_encode(["error" => $error]);
        exit;
    }

    // Check plan exists & not deleted
    $check = $conn->prepare("SELECT plan_id FROM subscription_plans WHERE plan_id = ? AND status != 2");
    $check->bind_param("i", $data["plan_id"]);
    $check->execute();
    $check->store_result();

    if ($check->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["error" => "Plan not found or deleted"]);
        exit;
    }
    $check->close();

    $stmt = $conn->prepare("
        UPDATE subscription_plans
        SET plan_name = ?, duration_days = ?, plan_type = ?,
            flat_price = ?, per_appointments_price = ?,
            percentage_per_appointments = ?, status = ?
        WHERE plan_id = ?
    ");

    $stmt->bind_param(
        "sissddii",
        $data["plan_name"],
        $data["duration_days"],
        $data["plan_type"],
        $data["flat_price"],
        $data["per_appointments_price"],
        $data["percentage_per_appointments"],
        $data["status"],
        $data["plan_id"]
    );

    if ($stmt->execute()) {
        echo json_encode(["message" => "Plan updated successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
    }

    $stmt->close();
}


//   SOFT DELETE (DELETE)
elseif ($method === "DELETE") {

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data["plan_id"])) {
        http_response_code(400);
        echo json_encode(["error" => "Plan ID required"]);
        exit;
    }

    $stmt = $conn->prepare("
        UPDATE subscription_plans
        SET status = 2
        WHERE plan_id = ?
    ");

    $stmt->bind_param("i", $data["plan_id"]);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Plan soft deleted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
    }

    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
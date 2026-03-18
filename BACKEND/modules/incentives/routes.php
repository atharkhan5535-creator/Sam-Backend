<?php
/**
 * Incentives Routes
 */

require_once __DIR__ . '/../../middlewares/authenticate.php';

$basePath = '/api/incentives';

// GET /api/incentives/monthly - Get monthly incentives (overall + staff breakdown)
$router->get("$basePath/monthly", function() {
    authenticate();
    $controller = new IncentiveController();
    return $controller->getMonthlyIncentives();
});

// GET /api/incentives/staff - Get incentives by staff
$router->get("$basePath/staff", function() {
    authenticate();
    $controller = new IncentiveController();
    return $controller->getByStaff();
});

// POST /api/incentives - Create incentive
$router->post("$basePath", function() {
    authenticate();
    $controller = new IncentiveController();
    return $controller->createIncentive();
});

// POST /api/incentives/payout - Process payout
$router->post("$basePath/payout", function() {
    authenticate();
    $controller = new IncentiveController();
    return $controller->processPayout();
});

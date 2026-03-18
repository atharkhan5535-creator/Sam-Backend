<?php
/**
 * Dashboard Routes
 */

require_once __DIR__ . '/../../middlewares/authenticate.php';

$basePath = '/api/dashboard';

// GET /api/dashboard/stats - Get dashboard statistics (total + period)
$router->get("$basePath/stats", function() {
    authenticate();
    $controller = new DashboardController();
    return $controller->getStats();
});

// GET /api/dashboard/revenue-chart - Get revenue chart data
$router->get("$basePath/revenue-chart", function() {
    authenticate();
    $controller = new DashboardController();
    return $controller->getRevenueChart();
});

// GET /api/dashboard/appointment-trends - Get appointment trends
$router->get("$basePath/appointment-trends", function() {
    authenticate();
    $controller = new DashboardController();
    return $controller->getAppointmentTrends();
});

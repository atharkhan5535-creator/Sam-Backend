<?php
/**
 * Dashboard Routes
 */

require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/DashboardController.php';

$dashboardController = new DashboardController();

$basePath = '/api/dashboard';

// GET /api/dashboard/stats - Get dashboard statistics (total + period)
$router->register('GET', "$basePath/stats", function() use ($dashboardController) {
    authenticate();
    $dashboardController->getStats();
});

// GET /api/dashboard/revenue-chart - Get revenue chart data
$router->register('GET', "$basePath/revenue-chart", function() use ($dashboardController) {
    authenticate();
    $dashboardController->getRevenueChart();
});

// GET /api/dashboard/appointment-trends - Get appointment trends
$router->register('GET', "$basePath/appointment-trends", function() use ($dashboardController) {
    authenticate();
    $dashboardController->getAppointmentTrends();
});

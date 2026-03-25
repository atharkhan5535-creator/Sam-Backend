<?php

// 🔥 ERROR REPORTING - ENABLE FOR DEBUGGING
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_error.log');

// 🔥 START OUTPUT BUFFERING - Catch any early output
ob_start();

// 🔥 CORS HEADERS — REQUIRED FOR BROWSER
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

// 🔥 HANDLE PREFLIGHT REQUEST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

require_once __DIR__ . '/../core/Request.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Router.php';

require_once __DIR__ . '/../helpers/PasswordHelper.php';

$router = new Router();

// Load all module routes
require __DIR__ . '/../modules/auth/routes.php';
require __DIR__ . '/../modules/customers/routes.php';
require __DIR__ . '/../modules/services/routes.php';
require __DIR__ . '/../modules/packages/routes.php';
require __DIR__ . '/../modules/staff/routes.php';
require __DIR__ . '/../modules/stock/routes.php';
require __DIR__ . '/../modules/appointments/routes.php';
require __DIR__ . '/../modules/invoices/routes.php';
require __DIR__ . '/../modules/payments/routes.php';  // ✅ Customer & Salon Payments
require __DIR__ . '/../modules/subscriptions/routes.php';
require __DIR__ . '/../modules/subscription-plans/routes.php';
require __DIR__ . '/../modules/salons/routes.php';
require __DIR__ . '/../modules/users/routes.php';
require __DIR__ . '/../modules/reports/routes.php';
require __DIR__ . '/../modules/dashboard/routes.php';  // Dashboard routes

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (strpos($uri, '/api/') !== false) {
    $uri = substr($uri, strpos($uri, '/api/'));
}

$uri = urldecode($uri);   // decode %0A
$uri = trim($uri);        // remove whitespace/newlines

$router->resolve($method, $uri);

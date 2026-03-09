<?php

require_once __DIR__ . '/StockController.php';
require_once __DIR__ . '/StockTransactionController.php';
require_once __DIR__ . '/../../middlewares/authenticate.php';
require_once __DIR__ . '/../../middlewares/authorize.php';

$stockController = new StockController();
$transactionController = new StockTransactionController();

/*
|--------------------------------------------------------------------------
| PRODUCT MANAGEMENT ROUTES (ADMIN, STAFF)
|--------------------------------------------------------------------------
*/

// Create Product
$router->register(
    'POST',
    '/api/admin/products',
    function() use ($stockController) {
        authorize(['ADMIN', 'STAFF']);
        $stockController->createProduct();
    }
);

// Update Product
$router->register(
    'PUT',
    '/api/admin/products/{product_id}',
    function($productId) use ($stockController) {
        authorize(['ADMIN', 'STAFF']);
        $stockController->updateProduct($productId);
    }
);

// List Products
$router->register(
    'GET',
    '/api/admin/products',
    function() use ($stockController) {
        authorize(['ADMIN', 'STAFF']);
        $stockController->listProducts();
    }
);

// View Product Details
$router->register(
    'GET',
    '/api/admin/products/{product_id}',
    function($productId) use ($stockController) {
        authorize(['ADMIN', 'STAFF']);
        $stockController->viewProduct($productId);
    }
);

/*
|--------------------------------------------------------------------------
| STOCK LEVELS ROUTES (ADMIN, STAFF)
|--------------------------------------------------------------------------
*/

// Update Stock Levels
$router->register(
    'PATCH',
    '/api/admin/stock/{product_id}',
    function($productId) use ($stockController) {
        authorize(['ADMIN', 'STAFF']);
        $stockController->updateStock($productId);
    }
);

// Get All Stock Levels
$router->register(
    'GET',
    '/api/admin/stock',
    function() use ($stockController) {
        authorize(['ADMIN', 'STAFF']);
        $stockController->getAllStockLevels();
    }
);

// Get Low Stock Alerts
$router->register(
    'GET',
    '/api/admin/stock/low-stock-alerts',
    function() use ($stockController) {
        authorize(['ADMIN', 'STAFF']);
        $stockController->getLowStockAlerts();
    }
);

/*
|--------------------------------------------------------------------------
| STOCK TRANSACTIONS ROUTES (ADMIN, STAFF)
|--------------------------------------------------------------------------
*/

// Create Stock Transaction (IN/OUT/ADJUSTMENT)
$router->register(
    'POST',
    '/api/admin/stock/transactions',
    function() use ($transactionController) {
        authorize(['ADMIN', 'STAFF']);
        $transactionController->create();
    }
);

// List Stock Transactions
$router->register(
    'GET',
    '/api/admin/stock/transactions',
    function() use ($transactionController) {
        authorize(['ADMIN', 'STAFF']);
        $transactionController->index();
    }
);

// View Stock Transaction
$router->register(
    'GET',
    '/api/admin/stock/transactions/{transaction_id}',
    function($transactionId) use ($transactionController) {
        authorize(['ADMIN', 'STAFF']);
        $transactionController->show($transactionId);
    }
);

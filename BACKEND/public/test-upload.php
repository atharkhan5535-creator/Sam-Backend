<?php
// Simple test upload script
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image'])) {
    echo json_encode(['error' => 'No file uploaded', 'FILES' => $_FILES]);
    exit;
}

$file = $_FILES['image'];
$uploadDir = __DIR__ . '/uploads/packages/';

echo json_encode([
    'success' => true,
    'file_info' => [
        'name' => $file['name'],
        'type' => $file['type'],
        'size' => $file['size'],
        'tmp_name' => $file['tmp_name'],
        'error' => $file['error']
    ],
    'upload_dir' => $uploadDir,
    'dir_exists' => is_dir($uploadDir),
    'dir_writable' => is_writable($uploadDir),
    'tmp_file_exists' => file_exists($file['tmp_name'])
]);

// Try to move the file
$filename = 'test_' . time() . '_' . $file['name'];
$filepath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $filepath)) {
    echo json_encode(['success' => true, 'message' => 'File saved', 'path' => $filepath]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to move file']);
}

<?php
require_once __DIR__ . '/helpers.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $skins = [];
    if (is_dir(EXTRACTED_DIR)) {
        foreach (glob(EXTRACTED_DIR . '*', GLOB_ONLYDIR) as $dir) {
            $id = basename($dir);
            $name = $id;
            $info = $dir . '/info.json';
            if (file_exists($info)) {
                $json = json_decode(file_get_contents($info), true);
                if (json_last_error() === JSON_ERROR_NONE && isset($json['name'])) {
                    $name = $json['name'];
                }
            }
            $skins[] = ['id' => $id, 'name' => $name];
        }
    }
    jsonResponse($skins);
} elseif ($method === 'POST') {
    if (!isset($_FILES['skin'])) {
        errorResponse('Missing file');
    }
    $file = $_FILES['skin'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        errorResponse('Upload error ' . $file['error']);
    }
    $skinId = sanitizeSkinName($file['name']);
    $uploadPath = UPLOADS_DIR . $skinId . '.deltaskin';
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        errorResponse('Cannot move uploaded file');
    }
    $extractPath = EXTRACTED_DIR . $skinId;
    if (!is_dir($extractPath)) {
        mkdir($extractPath, 0777, true);
    }
    if (!extractDeltaskin($uploadPath, $extractPath)) {
        unlink($uploadPath);
        errorResponse('Invalid archive');
    }
    jsonResponse(['id' => $skinId], 201);
} else {
    errorResponse('Unsupported', 405);
}
?> 
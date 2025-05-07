<?php
require_once __DIR__ . '/helpers.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$id = $_GET['id'] ?? null;
if (!$id) {
    errorResponse('Missing id');
}
$id = sanitizeSkinName($id);
$dir = EXTRACTED_DIR . $id . '/';
$info = $dir . 'info.json';
if (!is_dir($dir)) {
    errorResponse('Not found', 404);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (!file_exists($info)) {
            errorResponse('info.json missing', 404);
        }
        $json = json_decode(file_get_contents($info), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            errorResponse('Bad JSON', 500);
        }
        jsonResponse($json);
        break;

    case 'PUT':
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            errorResponse('Malformed JSON');
        }
        file_put_contents($info, json_encode($data, JSON_PRETTY_PRINT));
        jsonResponse(['saved' => true]);
        break;

    case 'DELETE':
        foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST) as $file) {
            $file->isDir() ? rmdir($file->getRealPath()) : unlink($file->getRealPath());
        }
        rmdir($dir);
        $zip = UPLOADS_DIR . $id . '.deltaskin';
        if (file_exists($zip)) unlink($zip);
        jsonResponse(['deleted' => true]);
        break;

    default:
        errorResponse('Unsupported', 405);
}
?> 
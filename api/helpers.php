<?php
require_once __DIR__ . '/config.php';

function sanitizeSkinName(string $name): string
{
    $name = pathinfo($name, PATHINFO_FILENAME);
    return preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name);
}

function extractDeltaskin(string $filepath, string $extractPath): bool
{
    $zip = new ZipArchive();
    if ($zip->open($filepath) === true) {
        $zip->extractTo($extractPath);
        $zip->close();
        return true;
    }
    return false;
}

function createDeltaskin(string $sourcePath, string $outputFilePath): bool
{
    $zip = new ZipArchive();
    if ($zip->open($outputFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourcePath, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::LEAVES_ONLY
        );
        foreach ($files as $file) {
            $filePath = $file->getRealPath();
            $relativePath = substr($filePath, strlen($sourcePath) + 1);
            $zip->addFile($filePath, $relativePath);
        }
        return $zip->close();
    }
    return false;
}

function jsonResponse($data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function errorResponse(string $message, int $statusCode = 400): void
{
    jsonResponse(['error' => $message], $statusCode);
}
?> 
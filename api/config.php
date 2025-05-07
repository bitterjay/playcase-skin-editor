<?php
// Configurable directory constants for the skin editor

define('BASE_DIR', realpath(__DIR__ . '/..') . DIRECTORY_SEPARATOR);

define('UPLOADS_DIR', BASE_DIR . 'uploads' . DIRECTORY_SEPARATOR);

define('EXTRACTED_DIR', BASE_DIR . 'extracted' . DIRECTORY_SEPARATOR);

// Ensure essential directories exist
foreach ([UPLOADS_DIR, EXTRACTED_DIR] as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0777, true);
    }
}
?> 
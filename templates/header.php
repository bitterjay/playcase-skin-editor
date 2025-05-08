<?php
$rootPath = rtrim(dirname(__DIR__), '/');
if (!defined('BASE_HREF')) {
    // Determine base href relative to web root (assumes project root is document root)
    $baseHref = '/'; // when project root = web root
    define('BASE_HREF', $baseHref);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skin Editor</title>
    <link rel="stylesheet" href="css/style.css">
  <!-- Font Awesome Free CDN -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">

</head>
<body>
<header class="site-header">
    <h1><a href="index.php">Skin Editor</a></h1>
    <nav>
        <a href="index.php">Skins</a>
        <a href="create.php" title="New Skin" style="font-size:24px;margin-left:15px;"><i class="fa fa-plus"></i></a>
    </nav>
</header>
<main class="site-main"> 
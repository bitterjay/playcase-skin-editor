<?php
require_once __DIR__ . '/templates/header.php';
?>
<section class="skin-list-section">
    <h2>Available Skins</h2>
    <div id="skin-list" class="skin-list"></div>

    <h3>Upload .deltaskin</h3>
    <form id="upload-form" enctype="multipart/form-data">
        <input type="file" name="skin" accept=".deltaskin,.zip" required>
        <button type="submit">Upload</button>
    </form>
</section>

<?php
require_once __DIR__ . '/templates/footer.php';
?> 
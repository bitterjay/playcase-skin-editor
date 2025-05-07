<?php
$id = $_GET['id'] ?? null;
if (!$id) {
    header('Location: index.php');
    exit;
}
require_once __DIR__ . '/templates/header.php';
?>
<section class="editor-section" data-skin-id="<?php echo htmlspecialchars($id); ?>">
    <h2>Edit Skin</h2>
    <form id="skin-form">
        <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
            <label for="identifier">Identifier</label>
            <input type="text" id="identifier" name="identifier" required>
        </div>
        <div class="form-group">
            <label for="gameTypeIdentifier">Game Type Identifier</label>
            <input type="text" id="gameTypeIdentifier" name="gameTypeIdentifier" required>
        </div>
        <div class="form-group">
            <label for="debug">Debug</label>
            <select id="debug" name="debug">
                <option value="0">False</option>
                <option value="1">True</option>
            </select>
        </div>
        <button type="submit">Save</button>
    </form>

    <hr>
    <h3>Device Configuration</h3>
    <div class="form-group">
        <label>Device</label>
        <select id="device-select"></select>
    </div>
    <div class="form-group">
        <label>Variant</label>
        <select id="variant-select"></select>
    </div>
    <div class="form-group">
        <label>Orientation</label>
        <select id="orientation-select"></select>
    </div>

    <div id="orientation-form" style="margin-top:20px;"></div>

    <a id="download-link" href="#" class="btn">Download .deltaskin</a>
    <h3>JSON Structure</h3>
    <div id="json-viewer" class="json-viewer"></div>
</section>
<?php require_once __DIR__ . '/templates/footer.php'; ?> 
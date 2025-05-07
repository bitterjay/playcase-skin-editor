<?php
require_once __DIR__ . '/templates/header.php';
?>
<section class="new-skin-section">
  <h2>Create New Skin</h2>
  <form id="new-skin-form">
    <div class="form-wrapper">
      <div class="form-group"><label>Name</label><input type="text" name="name" required></div>
      <div class="form-group"><label>Identifier</label><input type="text" name="identifier" required></div>
      <div class="form-group"><label>Game Type</label>
        <select name="gameTypeIdentifier" id="game-select"></select>
      </div>
      <div class="form-group"><label>Representation Options</label>
        <label style="margin-right:10px;"><input type="checkbox" id="include-iphone" checked> iPhone</label>
        <label><input type="checkbox" id="include-ipad"> iPad</label>
      </div>
      <div class="form-group"><label>Debug</label>
        <select name="debug"><option value="0">False</option><option value="1">True</option></select>
      </div>
      <div class="form-group"><label>Device Model (for mapping preview)</label>
        <select id="device-select"></select>
      </div>
    </div>
    <div class="form-wrapper">
      <button type="submit">Create</button>
    </div>
  </form>
</section>
<section class="preview-section">
  <h2>Preview</h2>
  <div class="view-controls">
    <label>Representation </label>
    <select id="rep-select"></select>
    <label style="margin-left:10px;">Variant </label>
    <select id="variant-select-new"></select>
  </div>
  <div id="device-preview" style="border:1px solid #ccc;margin-top:10px;display:none;"></div>
</section>
<section class="preview-section">
  <h2>JSON Preview</h2>
  <pre id="json-preview" class="json-viewer"></pre>
</section>

<?php require_once __DIR__ . '/templates/footer.php'; ?> 
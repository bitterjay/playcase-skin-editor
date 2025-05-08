<?php
require_once __DIR__ . '/templates/header.php';
?>
<section class="section selection-header">
  <div class="container nav-bar">
    <div class="nav-block">
      <div id="skin-name-display" style="display:inline-block;margin-left:var(--spacing-s);">
        <strong><span id="current-skin-name">Untitled Skin</span></strong> 
      </div>
      <div id="selected-devices-display" style="display:inline-block;margin-left:var(--spacing-s);">
        <span class="device-info" id="device-info-text">No devices selected</span>
      </div>
    </div>
    <div class="nav-block icon-btn-container">
      <button type="button" id="open-meta" class="icon-btn" title="Skin Details"><i class="fa fa-info-circle"></i></button>
      <button type="button" id="open-settings" class="icon-btn" title="Representation & Variants"><i class="fa fa-cog"></i></button>
      <button type="button" id="open-preview" class="icon-btn" title="Mapping Preview"><i class="fa fa-mobile-screen"></i></button>
      <button type="button" id="save-skin-btn" class="icon-btn" title="Save Skin" style="margin-right:var(--spacing-s);"><i class="fa fa-save"></i></button>
    </div>
  </div>
</section>

<section class="new-skin-section">
  <form id="new-skin-form">
    <div class="form-wrapper">
      <!-- Modal -->
      <div id="meta-modal" class="modal" style="display:none;">
        <div class="modal-content">
          <span id="close-meta" class="close">&times;</span>
          <h3>Skin Details</h3>
          <div class="form-group"><label>Name</label><input type="text" name="name" placeholder="Skin Name" required></div>
          <div class="form-group"><label>Identifier</label><input type="text" name="identifier" placeholder="App Name" required></div>
          <div class="form-group"><label>Domain</label>
            <input type="text" id="domain-input" placeholder="com.yourdomain" required>
          </div>
          <div class="form-group"><label>Console</label>
            <select id="console-select"></select>
          </div>
          <input type="hidden" name="gameTypeIdentifier" id="game-type-field">
          <div class="form-group"><label>Debug</label>
            <select name="debug"><option value="0">False</option><option value="1">True</option></select>
          </div>
          <button type="button" id="close-meta-save" class="btn">Done</button>
        </div>
      </div>
    </div>
  </form>
</section>

<section class="preview-section section">
  
  <div class="preview-container container">
    <div class="preview-block" id="preview-block">
      <h2>Currently Selected Skin Preview</h2>
      <div class="view-controls">
        <label>Representation</label>
        <select id="rep-select"></select>
        <label style="margin-left:10px;">Variant </label>
        <select id="variant-select-new"></select>
        <label style="margin-left:10px;">Orientation </label>
        <select id="orientation-preview-select">
          <option value="portrait" selected>Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>
      <div id="device-preview" style="border:1px solid #ccc;"></div>
    </div>
  <div class="container preview-block" id="json-preview-block">
    <h2>JSON Preview</h2>
    <pre id="json-preview" class="json-viewer"></pre>
  </div>
</section>


<div id="preview-modal" class="modal" style="display:none;">
  <div class="modal-content">
    <span id="close-preview" class="close">&times;</span>
    <h3>Mapping Size Selections</h3>
    <div id="mapping-preview-container">
    <!-- iPhone section -->
    <div id="iphone-preview-section" style="display:none;">
      <div class="form-group"><label>iPhone Model</label>
        <select id="device-select-iphone"></select>
      </div>
      <div id="preview-canvas-iphone" style="margin-top:var(--spacing-s);border:1px solid var(--secondary);display:flex;align-items:center;justify-content:center;"></div>
    </div>
    <!-- iPad section -->
    <div id="ipad-preview-section" style="display:none;">
      <div class="form-group"><label>iPad Model</label>
        <select id="device-select-ipad"></select>
      </div>
        <div id="preview-canvas-ipad" style="margin-top:var(--spacing-s);border:1px solid var(--secondary);display:flex;align-items:center;justify-content:center;"></div>
      </div>
    </div>
  </div>
</div>

<!-- Settings modal for Representation / Variant options -->
<div id="settings-modal" class="modal" style="display:none;">
  <div class="modal-content">
    <span id="close-settings" class="close">&times;</span>
    <h3>Representation & Variants</h3>
    <div class="form-group"><label>Representation Options</label>
      <div class="toggle-group">
        <label class="toggle-btn" style="margin-right:var(--spacing-s);"><input type="checkbox" id="include-iphone" checked> iPhone</label>
        <label class="toggle-btn"><input type="checkbox" id="include-ipad"> iPad</label>
      </div>
    </div>
    <div class="form-group"><label>Variants</label>
      <span id="variant-checkboxes" style="display:inline-block;margin-left:var(--spacing-s);"></span>
    </div>
    <button type="button" id="save-settings" class="btn">Done</button>
  </div>
</div>

<?php require_once __DIR__ . '/templates/footer.php'; ?> 
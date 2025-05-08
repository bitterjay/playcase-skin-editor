// Helper to fetch JSON
async function api(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

document.addEventListener('DOMContentLoaded', () => {
    const skinListDiv = document.getElementById('skin-list');
    const uploadForm = document.getElementById('upload-form');
    const skinForm = document.getElementById('skin-form');
    const newSkinForm = document.getElementById('new-skin-form');

    // Define globally-scoped reference to the data loaded from options.json so it can be
    // accessed by helpers (e.g. renderDeviceModal) that live outside the new-skin block.
    let optionsData = null;

    // List page logic
    if (skinListDiv) {
        loadSkins();
    }
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(uploadForm);
            try {
                const json = await api('api/skins.php', { method: 'POST', body: formData });
                window.location.href = `edit.php?id=${json.id}`;
            } catch (err) {
                alert(err);
            }
        });
    }

    // Editor page logic
    if (skinForm) {
        const section = document.querySelector('.editor-section');
        const skinId = section.getAttribute('data-skin-id');
        let currentJson = null; // store full JSON
        const downloadLink = document.getElementById('download-link');
        downloadLink.href = `api/download.php?id=${skinId}`;
        loadSkin(skinId);

        function renderJson(obj) {
            const viewer = document.getElementById('json-viewer');
            viewer.textContent = JSON.stringify(obj, null, 2);
        }

        skinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentJson) { alert('JSON not loaded'); return; }
            currentJson.name = skinForm.name.value;
            currentJson.identifier = skinForm.identifier.value;
            currentJson.gameTypeIdentifier = skinForm.gameTypeIdentifier.value;
            currentJson.debug = skinForm.debug.value === '1';
            const obj = currentJson;
            try {
                await api(`api/skin.php?id=${skinId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(obj)
                });
                alert('Saved!');
                renderJson(currentJson);
                populateSelectors();
            } catch (err) {
                alert(err);
            }
        });
    }

    // New skin logic
    if (newSkinForm) {
        // populate selects from options.json
        fetch('options.json').then(r=>r.json()).then(opts=>{
            optionsData=opts;
            const consoleSel=document.getElementById('console-select');
            const consoles=Object.entries(opts.gameTypeIdentifiers).map(([name,val])=>{
                const suffix=val.split('.').pop();
                return {name, suffix};
            });
            // add PS and 3DS manually
            consoles.push({name:'ps',suffix:'ps'},{name:'3ds',suffix:'3ds'});
            consoles.forEach(c=>consoleSel.add(new Option(c.name,c.suffix)));

            function composeGameType(){
                const domain=document.getElementById('domain-input').value.trim();
                const consoleVal=consoleSel.value;
                const full=`${domain}.delta.game.${consoleVal}`;
                document.getElementById('game-type-field').value=full;
                updateJsonPreview();
            }
            document.getElementById('domain-input').addEventListener('input',composeGameType);
            consoleSel.onchange=composeGameType;
            composeGameType();

            const repSel=document.getElementById('rep-select');
            function refreshRepOptions(){
                repSel.innerHTML='';
                opts.representations.forEach(r=>{
                   const include=(r==='iphone'?includeIphone.checked:includeIpad.checked);
                   if(include) repSel.add(new Option(r,r));
                });
                populateVariant();
            }
            const includeIphone=document.getElementById('include-iphone');
            const includeIpad=document.getElementById('include-ipad');
            includeIphone.onchange=()=>{refreshRepOptions();renderVariantCheckboxes();refreshOrientationOptions();};
            includeIpad.onchange=()=>{refreshRepOptions();renderVariantCheckboxes();refreshOrientationOptions();};
            refreshRepOptions();
            function populateVariant(){
                const varSel=document.getElementById('variant-select-new');
                varSel.innerHTML='';
                const device=repSel.value;
                opts.variants[device].forEach(v=>varSel.add(new Option(v,v)));
                if(device==='iphone' && opts.variants['iphone'].includes('edgeToEdge')) varSel.value='edgeToEdge';
                // ensure change triggers preview update and orientation refresh
                varSel.onchange = ()=>{updateJsonPreview();refreshOrientationOptions();renderDevicePreview();};
                // refresh orientation options initial
                refreshOrientationOptions();
                updateJsonPreview();
            }
            populateVariant();

            // populate device select (only if such element exists – present in modal in earlier version)
            const deviceSel=document.getElementById('device-select');
            function populateDeviceModels(){
                if(!deviceSel) return;
                const rep=repSel.value;
                deviceSel.innerHTML='';
                const map = rep==='ipad'?opts.ipadLogicalSizes:opts.iphoneLogicalSizes;
                Object.keys(map).forEach(model=>deviceSel.add(new Option(model,model)));
                // Default selections
                const defaults={};
                const defName = defaults[device];
                if(defName && map[defName]){
                    deviceSel.value = defName;
                }
                renderDevicePreview(device);
                renderDevicePreview();
            }
            repSel.onchange=()=>{populateVariant();populateDeviceModels();renderVariantCheckboxes();refreshOrientationOptions();};
            if(deviceSel){
               deviceSel.onchange=()=>{renderDevicePreview(device); if(window.updateJsonPreview) window.updateJsonPreview(); if(window.updateMainPreview) updateMainPreview(); updateSelectedDevicesDisplay();};
            }
            function renderDevicePreview(){
               if(!deviceSel) return;
               const model=deviceSel.value;
               const preview=document.getElementById('device-preview');
               if(!model||!preview){return;}
               const rep=repSel.value;
               const map = rep==='ipad'?opts.ipadLogicalSizes:opts.iphoneLogicalSizes;
               const selectEl = document.getElementById(rep==='iphone'?'device-select-iphone':'device-select-ipad');
               const modelKey = selectEl?.value;
               const container=document.querySelector('.preview-container');
               if(!modelKey){
                   if(container) container.classList.add('preview-disabled');
                   return;
               }
               if(container) container.classList.remove('preview-disabled');
               const orientationSel=document.getElementById('orientation-preview-select');
               const ori=orientationSel?orientationSel.value:'portrait';
               let szObj = map[modelKey];
               const sz = ori==='landscape'?{width:szObj.height,height:szObj.width}:szObj;
               const scale=1;
               preview.style.width=sz.width*scale+'px';
               preview.style.height=sz.height*scale+'px';
               preview.textContent=`${sz.width} x ${sz.height}`;
               preview.style.display='block';
            }
            populateDeviceModels();

            function updateJsonPreview(){
               const data=Object.fromEntries(new FormData(newSkinForm).entries());
               const obj={
                 name:data.name||'',
                 identifier:data.identifier||'',
                 gameTypeIdentifier:data.gameTypeIdentifier||'',
                 debug:data.debug==='1',
                 representations: buildRepresentations()
               };
               document.getElementById('json-preview').textContent=JSON.stringify(obj,null,2);
               const nameDisplay=document.getElementById('current-skin-name');
               if(nameDisplay){nameDisplay.textContent=data.name||'Untitled Skin';}
            }
            newSkinForm.addEventListener('input',updateJsonPreview);
            updateJsonPreview();
            // expose globally for modal buttons
            window.updateJsonPreview = updateJsonPreview;

            function applyToggleStyles(scope){
                scope.querySelectorAll('label.toggle-btn').forEach(lbl=>{
                    const cb = lbl.querySelector('input[type="checkbox"]');
                    if(!cb) return;
                    const sync = ()=>{lbl.classList.toggle('active',cb.checked);};
                    sync();
                    cb.addEventListener('change', sync);
                });
            }

            // apply to existing toggle buttons (representation options) initially
            applyToggleStyles(document);

            function renderVariantCheckboxes(){
                const container=document.getElementById('variant-checkboxes');
                container.innerHTML='';

                const devices=[['iphone','iPhone'],['ipad','iPad']];
                devices.forEach(([device,labelText])=>{
                    const include=document.getElementById(`include-${device}`)?.checked;
                    if(!include) return;  // skip section if representation not included

                    // Section header
                    const header=document.createElement('h4');
                    header.textContent=labelText+" Variants";
                    header.style.margin='var(--spacing-s) 0 var(--spacing-xs) 0';
                    container.appendChild(header);

                    opts.variants[device].forEach(v=>{
                        // Row wrapper
                        const row=document.createElement('div');
                        row.style.display='flex';
                        row.style.alignItems='center';
                        row.style.gap='var(--spacing-xs)';
                        // Variant label
                        const nameSpan=document.createElement('span');
                        nameSpan.textContent=v;
                        nameSpan.style.minWidth='80px';
                        row.appendChild(nameSpan);

                        const orientations=['portrait','landscape'];
                        orientations.forEach(o=>{
                            const id=`var-${device}-${v}-${o}`;
                            const short=o==='portrait'?'P':'L';
                            const lbl=document.createElement('label');
                            lbl.className='toggle-btn';
                            lbl.innerHTML=`<input type="checkbox" id="${id}" data-device="${device}" data-variant="${v}" data-orientation="${o}"> ${short}`;
                            // Defaults:
                            // iPhone edgeToEdge → portrait selected; everything else unchecked
                            // iPad none selected
                            const cb = lbl.querySelector('input');
                            if(device==='iphone' && v==='edgeToEdge' && o==='portrait'){
                                cb.checked=true;
                            }
                            row.appendChild(lbl);
                        });
                        container.appendChild(row);
                    });
                });

                applyToggleStyles(container);
                container.querySelectorAll('input[type="checkbox"]').forEach(cb=>cb.onchange=()=>{updateJsonPreview();refreshOrientationOptions();});
                // after building variants update orientation list
                refreshOrientationOptions();
            }

            // Modify updateJsonPreview to build orientations
            function buildRepresentations(){
                 const reps={};
                 const incPhone=document.getElementById('include-iphone').checked;
                 const incPad=document.getElementById('include-ipad').checked;
                 if(incPhone){
                     reps['iphone']={};
                     opts.variants['iphone'].forEach(v=>{
                         const orientations=['portrait','landscape'].filter(o=>document.getElementById(`var-iphone-${v}-${o}`)?.checked);
                         if(orientations.length){
                             reps['iphone'][v] = {};
                             const model=document.getElementById('device-select-iphone')?.value;
                             const size=optionsData.iphoneLogicalSizes[model]||{width:0,height:0};
                             orientations.forEach(o=>{const mapping=o==='landscape'?{width:size.height,height:size.width}:{width:size.width,height:size.height};reps['iphone'][v][o] = {mappingSize:mapping};});
                         }
                     });
                 }
                 if(incPad){
                     reps['ipad']={};
                     opts.variants['ipad'].forEach(v=>{
                         const orientations=['portrait','landscape'].filter(o=>document.getElementById(`var-ipad-${v}-${o}`)?.checked);
                         if(orientations.length){
                             reps['ipad'][v] = {};
                             const model=document.getElementById('device-select-ipad')?.value;
                             const size=optionsData.ipadLogicalSizes[model]||{width:0,height:0};
                             orientations.forEach(o=>{const mapping=o==='landscape'?{width:size.height,height:size.width}:{width:size.width,height:size.height};reps['ipad'][v][o]={mappingSize:mapping};});
                         }
                     });
                 }
                 return reps;
            }

            // initial populate
            renderVariantCheckboxes();
            // expose for other scopes
            window.renderVariantCheckboxes = renderVariantCheckboxes;

            const saveBtn=document.getElementById('save-skin-btn');
            if(saveBtn) saveBtn.onclick=()=>newSkinForm.requestSubmit();

            // Ensure device model list is built for iPhone so preview can match on load
            populateDeviceModels('iphone');
            updateMainPreview();
            updateJsonPreview();
        });

        newSkinForm.addEventListener('submit',async e=>{
            e.preventDefault();
            const data=Object.fromEntries(new FormData(newSkinForm).entries());
            data.representation = document.getElementById('rep-select').value;
            data.variant = document.getElementById('variant-select-new').value;
            data.debug = data.debug==='1';
            data.includeIphone = includeIphone.checked;
            data.includeIpad = includeIpad.checked;
            const variantsObj={};
            if(includeIphone.checked){
                variantsObj.iphone = opts.variants['iphone'].filter(v=>document.getElementById(`var-iphone-${v}`)?.checked);
            }
            if(includeIpad.checked){
                variantsObj.ipad = opts.variants['ipad'].filter(v=>document.getElementById(`var-ipad-${v}`)?.checked);
            }
            data.variants = variantsObj;
            try{
              const res=await api('api/newSkin.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
              window.location.href=`edit.php?id=${res.id}`;
            }catch(err){alert(err);}
        });
    }

    // modal controls
    if(document.getElementById('meta-modal')){
        const modal=document.getElementById('meta-modal');
        document.getElementById('open-meta').onclick=()=>{modal.style.display='flex';};
        document.getElementById('close-meta').onclick=()=>{modal.style.display='none';};
        document.getElementById('close-meta-save').onclick=()=>{
            modal.style.display='none';
            updateJsonPreview();
            const nameVal=document.querySelector('input[name="name"]').value.trim();
            const nameDisplay=document.getElementById('current-skin-name');
            if(nameDisplay) nameDisplay.textContent=nameVal||'Untitled Skin';
        };
    }

    // after modal meta controls add preview modal
    const previewModal=document.getElementById('preview-modal');
    if(previewModal){
        document.getElementById('open-preview').onclick=()=>{previewModal.style.display='flex';renderDeviceModal();};
        document.getElementById('close-preview').onclick=()=>{previewModal.style.display='none';};
    }

    // settings modal (representation & variant options)
    const settingsModal=document.getElementById('settings-modal');
    if(settingsModal){
        const openBtn=document.getElementById('open-settings');
        const closeBtn=document.getElementById('close-settings');
        const saveBtn=document.getElementById('save-settings');
        const hide=()=>{settingsModal.style.display='none';if(window.updateJsonPreview) window.updateJsonPreview();if(window.renderVariantCheckboxes) window.renderVariantCheckboxes();renderDeviceModal();};
        if(openBtn) openBtn.onclick=()=>{settingsModal.style.display='flex';};
        if(closeBtn) closeBtn.onclick=hide;
        if(saveBtn) saveBtn.onclick=hide;
    }

    // ========== Mapping-preview modal ==========
    function populateDeviceModels(device){
        if(!optionsData) return;
        const selectId = device==='iphone' ? 'device-select-iphone' : 'device-select-ipad';
        const selectEl = document.getElementById(selectId);
        if(!selectEl) return;
        const map = device==='iphone'?optionsData.iphoneLogicalSizes:optionsData.ipadLogicalSizes;
        // Repopulate list
        selectEl.innerHTML='';
        Object.keys(map).forEach(model=>selectEl.add(new Option(model,model)));
        // Default selections
        const defaults={};
        const defName = defaults[device];
        if(defName && map[defName]){
            selectEl.value = defName;
        }
        selectEl.onchange = ()=> {renderDevicePreview(device); if(window.updateJsonPreview) window.updateJsonPreview(); if(window.updateMainPreview) updateMainPreview(); updateSelectedDevicesDisplay();};
        // Pick first model by default
        if(selectEl.options.length && !selectEl.value) selectEl.selectedIndex = 0;
        renderDevicePreview(device);
    }

    function renderDevicePreview(device){
        if(!optionsData) return;
        const selectEl = document.getElementById(device==='iphone'?'device-select-iphone':'device-select-ipad');
        const model = selectEl?.value;
        if(!model) return;
        const orientationSel=document.getElementById('orientation-preview-select');
        const ori=orientationSel?orientationSel.value:'portrait';
        const canvas = document.getElementById(device==='iphone'?'preview-canvas-iphone':'preview-canvas-ipad');
        const map = device==='iphone'?optionsData.iphoneLogicalSizes:optionsData.ipadLogicalSizes;
        let szObj = map[model];
        const sz = ori==='landscape'?{width:szObj.height,height:szObj.width}:szObj;
        const scale = 0.25;
        canvas.style.width = sz.width*scale+'px';
        canvas.style.height = sz.height*scale+'px';
        canvas.textContent = `${sz.width} x ${sz.height}`;

        // Reflect on main preview area
        const mainPrev = document.getElementById('device-preview');
        if(mainPrev){
            mainPrev.style.width = sz.width + 'px';
            mainPrev.style.height = sz.height + 'px';
            mainPrev.textContent = `${sz.width} x ${sz.height}`;
            mainPrev.style.display = 'block';
        }
    }

    function renderDeviceModal(){
        const iphoneSec = document.getElementById('iphone-preview-section');
        const ipadSec   = document.getElementById('ipad-preview-section');
        if(!iphoneSec || !ipadSec) return;
        // Determine which representations are included
        const incPhone = document.getElementById('include-iphone')?.checked;
        const incPad   = document.getElementById('include-ipad')?.checked;

        iphoneSec.style.display = incPhone ? 'block' : 'none';
        ipadSec.style.display   = incPad   ? 'block' : 'none';

        if(incPhone) populateDeviceModels('iphone');
        if(incPad)   populateDeviceModels('ipad');
    }

    // Re-render modal contents whenever representation options change
    ['include-iphone','include-ipad'].forEach(id=>{
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', ()=>{ if(previewModal.style.display==='flex') renderDeviceModal(); });
    });

    async function loadSkins() {
        skinListDiv.innerHTML = 'Loading…';
        try {
            const skins = await api('api/skins.php');
            skinListDiv.innerHTML = '';
            skins.forEach(s => {
                const div = document.createElement('div');
                div.className = 'skin-item';
                div.innerHTML = `<span>${s.name}</span><a href="edit.php?id=${s.id}">Edit</a>`;
                skinListDiv.appendChild(div);
            });
        } catch (err) {
            skinListDiv.textContent = err;
        }
    }

    async function loadSkin(id) {
        try {
            const json = await api(`api/skin.php?id=${id}`);
            currentJson = json;
            renderJson(currentJson);
            skinForm.name.value = json.name || '';
            skinForm.identifier.value = json.identifier || '';
            skinForm.gameTypeIdentifier.value = json.gameTypeIdentifier || '';
            skinForm.debug.value = json.debug ? '1' : '0';
        } catch (err) {
            alert(err);
        }
    }

    function populateSelectors() {
        if (!currentJson) return;
        const devSel = document.getElementById('device-select');
        const varSel = document.getElementById('variant-select');
        const oriSel = document.getElementById('orientation-select');

        devSel.innerHTML = '';
        Object.keys(currentJson.representations || {}).forEach(dev => {
            const opt = new Option(dev, dev);
            devSel.add(opt);
        });
        devSel.onchange = () => populateVariants();
        populateVariants();

        function populateVariants() {
            const device = devSel.value;
            varSel.innerHTML = '';
            const variants = currentJson.representations[device] || {};
            Object.keys(variants).forEach(v => varSel.add(new Option(v, v)));
            varSel.onchange = () => populateOrientations();
            populateOrientations();
        }

        function populateOrientations() {
            const device = devSel.value;
            const variant = varSel.value;
            oriSel.innerHTML = '';
            const oris = currentJson.representations[device][variant] || {};
            Object.keys(oris).forEach(o => oriSel.add(new Option(o, o)));
            oriSel.onchange = () => showOrientationForm();
            showOrientationForm();
        }
    }

    function showOrientationForm() {
        const dev = document.getElementById('device-select').value;
        const variant = document.getElementById('variant-select').value;
        const ori = document.getElementById('orientation-select').value;
        const container = document.getElementById('orientation-form');
        if (!dev || !variant || !ori) { container.innerHTML = ''; return; }
        const cfg = currentJson.representations[dev][variant][ori];
        container.innerHTML = `
            <h4>Mapping Size</h4>
            <div class="form-group"><label>Width</label><input type="number" id="map-width" value="${cfg.mappingSize.width}"></div>
            <div class="form-group"><label>Height</label><input type="number" id="map-height" value="${cfg.mappingSize.height}"></div>
            <button id="save-orientation">Save Orientation</button>
        `;
        document.getElementById('save-orientation').onclick = async () => {
            cfg.mappingSize.width = parseInt(document.getElementById('map-width').value,10);
            cfg.mappingSize.height = parseInt(document.getElementById('map-height').value,10);
            renderJson(currentJson);
            await api(`api/skin.php?id=${section.getAttribute('data-skin-id')}`, {
                method:'PUT',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(currentJson)
            });
            alert('Orientation saved');
        };
    }

    function updateMainPreview(){
        const preview=document.getElementById('device-preview');
        if(!preview) return;
        const repSelEl=document.getElementById('rep-select');
        if(!repSelEl) return;
        const rep=repSelEl.value;
        if(!optionsData) return;
        const map = rep==='ipad'?optionsData.ipadLogicalSizes:optionsData.iphoneLogicalSizes;
        const selectEl = document.getElementById(rep==='iphone'?'device-select-iphone':'device-select-ipad');
        const modelKey = selectEl?.value;
        const container=document.querySelector('.preview-container');
        if(!modelKey){
            if(container) container.classList.add('preview-disabled');
            return;
        }
        if(container) container.classList.remove('preview-disabled');
        const oriSel=document.getElementById('orientation-preview-select');
        const oriVal=oriSel?oriSel.value:'portrait';
        const raw=map[modelKey];
        const sz = oriVal==='landscape'?{width:raw.height,height:raw.width}:raw;
        preview.style.width=sz.width+'px';
        preview.style.height=sz.height+'px';
        preview.textContent=`${sz.width} x ${sz.height}`;
        preview.style.display='block';
    }

    window.updateMainPreview = updateMainPreview;

    updateMainPreview();
    document.getElementById('rep-select').onchange = ()=>{populateVariant();updateMainPreview();renderVariantCheckboxes();refreshOrientationOptions();};
    document.getElementById('variant-select-new').onchange = ()=>{updateJsonPreview();updateMainPreview();};

    const orientationSel=document.getElementById('orientation-preview-select');
    if(orientationSel){
        orientationSel.onchange=()=>{updateMainPreview();renderDevicePreview(document.getElementById('rep-select').value==='iphone'?'iphone':'ipad');updateJsonPreview();};
    }

    function refreshOrientationOptions(){
        const repSelEl3=document.getElementById('rep-select');
        const varSelEl2=document.getElementById('variant-select-new');
        if(!repSelEl3||!varSelEl2) return;
        const device=repSelEl3.value;
        const variant=varSelEl2.value;
        // get orientations that are enabled via checkboxes
        const available=['portrait','landscape'].filter(o=>document.getElementById(`var-${device}-${variant}-${o}`)?.checked);
        orientationSel.innerHTML='';
        available.forEach(o=>orientationSel.add(new Option(o,o)));
        // if none selected, fallback to portrait/landscape default list
        if(orientationSel.options.length===0){['portrait','landscape'].forEach(o=>orientationSel.add(new Option(o,o)));}
        // ensure value set
        orientationSel.value = orientationSel.options[0]?.value || 'portrait';
    }

    // --- Selected devices display ---
    function updateSelectedDevicesDisplay(){
        const iphoneModel=document.getElementById('device-select-iphone')?.value;
        const ipadModel=document.getElementById('device-select-ipad')?.value;
        const displayEl=document.getElementById('device-info-text');
        if(!displayEl) return;
        const parts=[];
        if(iphoneModel) parts.push(`iPhone: ${iphoneModel}`);
        if(ipadModel) parts.push(`iPad: ${ipadModel}`);
        displayEl.textContent = parts.length?parts.join(' | '):'No devices selected';
    }
    window.updateSelectedDevicesDisplay=updateSelectedDevicesDisplay;

    // call once after initial load
    updateSelectedDevicesDisplay();
}); 
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
            const gameSel=document.getElementById('game-select');
            Object.entries(opts.gameTypeIdentifiers).forEach(([k,v])=>{
                gameSel.add(new Option(k,v));
            });
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
            includeIphone.onchange=refreshRepOptions;
            includeIpad.onchange=refreshRepOptions;
            refreshRepOptions();
            function populateVariant(){
                const varSel=document.getElementById('variant-select-new');
                varSel.innerHTML='';
                const device=repSel.value;
                opts.variants[device].forEach(v=>varSel.add(new Option(v,v)));
                updateJsonPreview();
            }
            populateVariant();

            // populate device select
            const deviceSel=document.getElementById('device-select');
            function populateDeviceModels(){
                const rep=repSel.value;
                deviceSel.innerHTML='';
                const map = rep==='ipad'?opts.ipadLogicalSizes:opts.iphoneLogicalSizes;
                Object.entries(map).forEach(([model,size])=>deviceSel.add(new Option(model,model)));
                renderDevicePreview();
            }
            repSel.onchange=()=>{populateVariant();populateDeviceModels();};
            deviceSel.onchange=()=>renderDevicePreview();
            function renderDevicePreview(){
               const model=deviceSel.value;
               const preview=document.getElementById('device-preview');
               if(!model){preview.style.display='none';return;}
               const rep=repSel.value;
               const sz=(rep==='ipad'?opts.ipadLogicalSizes:opts.iphoneLogicalSizes)[model];
               const scale=1;
               preview.style.width=sz.width*scale+'px';
               preview.style.height=sz.height*scale+'px';
               preview.textContent=`${sz.width} x ${sz.height}`;
               preview.style.display='block';
            }
            populateDeviceModels();

            function updateJsonPreview(){
               const data=Object.fromEntries(new FormData(newSkinForm).entries());
               const rep=document.getElementById('rep-select').value;
               const variant=document.getElementById('variant-select-new').value;
               const obj={
                 name:data.name||'',
                 identifier:data.identifier||'',
                 gameTypeIdentifier:data.gameTypeIdentifier||'',
                 debug:data.debug==='1',
                 representations: (()=>{
                     const reps={};
                     if(includeIphone.checked){ reps['iphone']={ [rep==='iphone'?variant:'standard']:{ portrait:{} } }; }
                     if(includeIpad.checked){ reps['ipad']={ [rep==='ipad'?variant:'standard']:{ portrait:{} } }; }
                     return reps;
                 })()
               };
               document.getElementById('json-preview').textContent=JSON.stringify(obj,null,2);
            }
            newSkinForm.addEventListener('input',updateJsonPreview);
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
            try{
              const res=await api('api/newSkin.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
              window.location.href=`edit.php?id=${res.id}`;
            }catch(err){alert(err);}
        });
    }

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
}); 
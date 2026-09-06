// =========================================================
// Integration Metadata Registry
// =========================================================
const integrations = {
    stream: {
        title: 'Custom Stream',
        desc: 'Add any RTSP, RTMP, HTTP, WebRTC, or file URL directly as a live stream.',
        icon: '<svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>'
    },
    onvif: {
        title: 'ONVIF Cameras',
        desc: 'Automatically discover ONVIF IP cameras on the local network and test stream URLs.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'
    },
    homekit: {
        title: 'Apple HomeKit',
        desc: 'Discover, pair with setup PIN, and manage HomeKit camera accessories.',
        icon: '<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
    },
    hass: {
        title: 'Home Assistant',
        desc: 'Import and stream cameras configured in your Home Assistant instance.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>'
    },
    ring: {
        title: 'Ring',
        desc: 'Connect Ring Video Doorbells, Stick Up Cams, and Floodlights via credentials or token.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>'
    },
    nest: {
        title: 'Google Nest',
        desc: 'Connect Nest Cams and Google Doorbell streams using OAuth and Google SDM API.',
        icon: '<svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>'
    },
    arenti: {
        title: 'Arenti',
        desc: 'Stream Arenti & Meari battery and wired cameras on-demand with automatic dormancy.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>'
    },
    wyze: {
        title: 'Wyze',
        desc: 'Access Wyze Cam v2, v3, Pan, and battery cameras with official Wyze API keys.',
        icon: '<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>'
    },
    tuya: {
        title: 'Tuya / Smart Life',
        desc: 'Import and stream smart cameras from Tuya, Smart Life, and Nedis ecosystems.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>'
    },
    xiaomi: {
        title: 'Xiaomi Mi Home',
        desc: 'Connect Mi Home cameras with multi-region support and captcha authentication.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2v-6h2v6zm0-8h-2V6h2v2zm4 8h-2v-4h2v4zm0-6h-2V6h2v2z"/></svg>'
    },
    roborock: {
        title: 'Roborock',
        desc: 'Stream live video feeds from onboard cameras on Roborock robotic vacuums.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V15a1 1 0 0 0-2 0v1.93A8 8 0 0 1 4.07 11H6a1 1 0 0 0 0-2H4.07A8 8 0 0 1 11 4.07V6a1 1 0 0 0 2 0V4.07A8 8 0 0 1 19.93 11H18a1 1 0 0 0 0 2h1.93A8 8 0 0 1 13 16.93z"/></svg>'
    },
    devices: {
        title: 'USB Webcams & Capture Cards',
        desc: 'Enumerate local USB webcams, DirectShow devices, and HDMI capture cards.',
        icon: '<svg viewBox="0 0 24 24"><path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95a2.2 2.2 0 0 0 4.4 0c0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/></svg>'
    },
    hardware: {
        title: 'FFmpeg Hardware Acceleration',
        desc: 'Check GPU hardware encoders/decoders (Nvidia NVENC, Intel QSV, VAAPI).',
        icon: '<svg viewBox="0 0 24 24"><path d="M6 2v4H2v2h4v4H2v2h4v4H2v2h4v4h2v-4h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4v-2h-4V8h4V6h-4V2h-2v4h-4V2h-2v4H8V2H6zm2 6h8v8H8V8z"/></svg>'
    },
    dvrip: {
        title: 'DVRIP (Xiongmai)',
        desc: 'Discover Xiongmai/XM-based cameras and DVRs on your local network.',
        icon: '<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z M2 4v16h20V4H2zm4 4h4v4H6V8zm0 6h4v2H6v-2zm6-6h6v2h-6V8zm0 4h6v2h-6v-2zm0 4h6v2h-6v-2z"/></svg>'
    },
    gopro: {
        title: 'GoPro Camera',
        desc: 'Discover connected GoPro Hero action cameras and stream live video feeds.',
        icon: '<svg viewBox="0 0 24 24"><path d="M4 4h10v16H4V4zm12 4h4v8h-4V8z"/></svg>'
    },
    v4l2: {
        title: 'V4L2 (Linux Video)',
        desc: 'Enumerate Linux Video4Linux video capture devices and CSI camera modules.',
        icon: '<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2zm0 14H3V5h18v12z"/></svg>'
    },
    alsa: {
        title: 'ALSA Audio',
        desc: 'Detect Linux Advanced Linux Sound Architecture soundcards and microphone inputs.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>'
    },
    webtorrent: {
        title: 'WebTorrent Shares',
        desc: 'Inspect active WebTorrent peer-to-peer live stream shares and seeds.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
    }
};

// =========================================================
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const knownStreams = new Map(); // streamName -> Set of URLs

async function loadKnownStreams() {
    try {
        const r = await fetch('api/streams', { cache: 'no-cache' });
        if (r.ok) {
            const data = await r.json();
            knownStreams.clear();
            if (data && typeof data === 'object') {
                for (const [name, s] of Object.entries(data)) {
                    const urls = (s && s.producers ? s.producers : []).map(p => p.url).filter(Boolean);
                    knownStreams.set(name, new Set(urls));
                }
            }
        }
    } catch (e) {
        console.warn('Failed to load active streams:', e);
    }
}

function isStreamAdded(name, url) {
    if (name && knownStreams.has(name)) return true;
    if (url) {
        let encoded = url;
        let decoded = url;
        try { encoded = encodeURI(url); } catch (e) {}
        try { decoded = decodeURI(url); } catch (e) {}
        for (const urls of knownStreams.values()) {
            if (urls.has(url) || urls.has(encoded) || urls.has(decoded)) return true;
        }
    }
    return false;
}

// Initial fetch of active streams
loadKnownStreams();

// =========================================================
// Table Renderer
// =========================================================
async function drawTable(table, data) {
    await loadKnownStreams();

    if (!data || !data.sources || data.sources.length === 0) {
        table.innerHTML = `
            <tbody>
                <tr>
                    <td colspan="6" class="table-empty-cell">
                        No devices or sources discovered on the network.
                    </td>
                </tr>
            </tbody>
        `;
        return;
    }

    // Sort entries alphabetically by name, id, or url
    data.sources.sort((a, b) => {
        const nameA = (a.name || a.id || a.url || '').toString();
        const nameB = (b.name || b.id || b.url || '').toString();
        return nameA.localeCompare(nameB, undefined, {numeric: true, sensitivity: 'base'});
    });

    const hasUrls = data.sources.some(s => s && s.url);
    const cols = ['id', 'name', 'info', 'url', 'location'];

    const th = (row) => {
        let html = cols.reduce((acc, k) => k in row ? `${acc}<th>${k.toUpperCase()}</th>` : acc, '<tr>');
        if (hasUrls) {
            html += '<th class="table-action-cell" style="width: 150px;">ACTION</th>';
        }
        return html + '</tr>';
    };

    const td = (row) => {
        let html = cols.reduce((acc, k) => {
            if (!(k in row)) return acc;
            const val = row[k] != null ? row[k] : '';
            return `${acc}<td>${escapeHtml(String(val))}</td>`;
        }, '<tr>');

        if (hasUrls) {
            if (row.url) {
                const streamName = row.name || row.id || row.url;
                const added = isStreamAdded(row.name || row.id, row.url);
                if (added) {
                    html += `<td class="table-action-cell">
                        <button type="button" class="btn btn-sm btn-stream-added" disabled title="Already configured in streams">
                            <svg viewBox="0 0 24 24" width="13" height="13" style="vertical-align:-2px;fill:currentColor;margin-right:4px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>In Streams
                        </button>
                    </td>`;
                } else {
                    html += `<td class="table-action-cell">
                        <button type="button" class="btn btn-sm btn-primary btn-add-stream" data-name="${escapeHtml(streamName)}" data-url="${escapeHtml(row.url)}" title="Add '${escapeHtml(streamName)}' to streams config">+ Add to Streams</button>
                    </td>`;
                }
            } else {
                html += '<td class="table-action-cell"></td>';
            }
        }
        return html + '</tr>';
    };

    const thead = th(data.sources[0]);
    const tbody = data.sources.reduce((html, source) => `${html}${td(source)}`, '');

    table.innerHTML = `<thead>${thead}</thead><tbody>${tbody}</tbody>`;
}

// Global 1-click Stream Adding Event Delegation
document.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('.btn-add-stream');
    if (btn) {
        if (btn.disabled) return;
        ev.preventDefault();
        ev.stopPropagation();

        const streamName = btn.dataset.name;
        const streamUrl = btn.dataset.url;
        if (!streamName || !streamUrl) return;

        btn.disabled = true;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<span class="table-loading-spinner" style="width:12px;height:12px;display:inline-block;vertical-align:-2px;margin-right:4px;"></span>Adding...`;

        try {
            // Encode spaces in stream URL if unescaped (e.g. "arenti://boat cam" -> "arenti://boat%20cam")
            // to satisfy go2rtc's server-side source validation which forbids raw spaces.
            const cleanUrl = streamUrl.includes(' ') ? encodeURI(streamUrl) : streamUrl;

            const url = new URL('api/streams', location.href);
            url.searchParams.set('name', streamName);
            url.searchParams.set('src', cleanUrl);
            const r = await fetch(url, { method: 'PUT' });

            if (!r.ok) {
                const errText = await r.text();
                throw new Error(errText || 'Failed to add stream');
            }

            if (!knownStreams.has(streamName)) {
                knownStreams.set(streamName, new Set());
            }
            knownStreams.get(streamName).add(cleanUrl);
            knownStreams.get(streamName).add(streamUrl);

            btn.className = 'btn btn-sm btn-stream-added';
            btn.disabled = true;
            btn.title = 'Already configured in streams';
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" style="vertical-align:-2px;fill:currentColor;margin-right:4px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>In Streams`;

            window.showToast(`Added "${streamName}" to streams!`, 'success');
        } catch (e) {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            window.showToast(`Error adding stream: ${e.message}`, 'error');
        }
        return;
    }

    // Optional click-to-add row: if user clicks on an un-added table row
    if (window.getSelection && window.getSelection().toString()) return;
    if (ev.target.closest('button, a, input, select, textarea')) return;

    const row = ev.target.closest('tr');
    if (!row) return;

    const addBtn = row.querySelector('.btn-add-stream');
    if (addBtn && !addBtn.disabled) {
        addBtn.click();
    }
});

async function getSources(tableID, url) {
    const table = document.getElementById(tableID);
    table.innerHTML = `
        <tbody>
            <tr>
                <td colspan="6" class="table-loading">
                    <div class="table-loading-spinner"></div>
                    <span>Scanning for available devices...</span>
                </td>
            </tr>
        </tbody>
    `;

    try {
        const r = typeof url === 'string' ? await fetch(url, {cache: 'no-cache'}) : url;
        if (!r.ok) {
            const errText = await r.text();
            table.innerHTML = `<tbody><tr><td colspan="6" class="table-error-cell">Error: ${errText || 'Failed to fetch sources'}</td></tr></tbody>`;
            return;
        }
        await drawTable(table, await r.json());
    } catch (e) {
        table.innerHTML = `<tbody><tr><td colspan="6" class="table-error-cell">Network error: ${e.message}</td></tr></tbody>`;
    }
}

// =========================================================
// Wizard Step Navigation
// =========================================================
const step1View = document.getElementById('step-1-view');
const step2View = document.getElementById('step-2-view');
const stepNav1 = document.getElementById('step-nav-1');
const stepNav2 = document.getElementById('step-nav-2');
const stepNav2Subtitle = document.getElementById('step-nav-2-subtitle');
const selectedIcon = document.getElementById('selected-icon');
const selectedTitle = document.getElementById('selected-title');
const selectedDesc = document.getElementById('selected-desc');

function goToStep(step, integrationId) {
    if (step === 1) {
        step1View.classList.remove('hidden');
        step2View.classList.add('hidden');
        stepNav1.classList.add('active');
        stepNav1.classList.remove('completed');
        stepNav2.classList.remove('active', 'completed', 'clickable');
        stepNav2Subtitle.textContent = 'Parameters & detected devices';
        history.replaceState(null, '', location.pathname);
        window.scrollTo({top: 0, behavior: 'smooth'});
    } else if (step === 2 && integrationId && integrations[integrationId]) {
        const meta = integrations[integrationId];
        step1View.classList.add('hidden');
        step2View.classList.remove('hidden');
        stepNav1.classList.remove('active');
        stepNav1.classList.add('completed', 'clickable');
        stepNav2.classList.add('active');
        stepNav2.classList.remove('completed');
        stepNav2Subtitle.textContent = meta.title;

        selectedTitle.textContent = meta.title;
        selectedDesc.textContent = meta.desc;
        selectedIcon.innerHTML = meta.icon;

        // Activate corresponding panel
        document.querySelectorAll('.wizard-panel').forEach(p => {
            p.classList.toggle('active', p.dataset.panel === integrationId);
        });

        history.replaceState(null, '', `#${integrationId}`);
        window.scrollTo({top: 0, behavior: 'smooth'});

        // Auto-trigger discovery/list on entering specific panels
        triggerPanelAutoFetch(integrationId);
    }
}

async function triggerPanelAutoFetch(id) {
    await loadKnownStreams();
    switch (id) {
        case 'onvif':
            getSources('onvif-table', 'api/onvif');
            break;
        case 'homekit':
            reloadHomeKit();
            break;
        case 'devices':
            getSources('devices-table', 'api/ffmpeg/devices');
            break;
        case 'hardware':
            getSources('hardware-table', 'api/ffmpeg/hardware');
            break;
        case 'hass':
            getSources('hass-table', 'api/hass');
            break;
        case 'dvrip':
            getSources('dvrip-table', 'api/dvrip');
            break;
        case 'alsa':
            getSources('alsa-table', 'api/alsa');
            break;
        case 'v4l2':
            getSources('v4l2-table', 'api/v4l2');
            break;
        case 'gopro':
            getSources('gopro-table', 'api/gopro');
            break;
        case 'webtorrent':
            getSources('webtorrent-table', 'api/webtorrent');
            break;
        case 'ring':
            ringReload();
            break;
        case 'nest':
            nestReload();
            break;
        case 'roborock':
            roborockReload();
            break;
        case 'arenti':
            arentiReload();
            break;
        case 'wyze':
            wyzeReload();
            break;
        case 'tuya':
            tuyaReload();
            break;
        case 'xiaomi':
            xiaomiReload();
            break;
    }
}

// Step navigation event handlers
stepNav1.addEventListener('click', () => goToStep(1));
document.getElementById('btn-wizard-back').addEventListener('click', () => goToStep(1));

// Sort integration cards alphabetically by title
function sortIntegrationGrid() {
    const grid = document.getElementById('integration-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.wizard-card'));
    cards.sort((a, b) => {
        const titleA = a.querySelector('.wizard-card-title')?.textContent?.trim() || '';
        const titleB = b.querySelector('.wizard-card-title')?.textContent?.trim() || '';
        return titleA.localeCompare(titleB, undefined, {numeric: true, sensitivity: 'base'});
    });
    cards.forEach(card => grid.appendChild(card));
}
sortIntegrationGrid();

// Card clicks
document.getElementById('integration-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.wizard-card');
    if (!card) return;
    const id = card.dataset.id;
    goToStep(2, id);
});

// Hash change / deep linking support
function handleHashChange() {
    const hash = location.hash.replace('#', '');
    if (hash && integrations[hash]) {
        goToStep(2, hash);
    } else {
        goToStep(1);
    }
}

window.addEventListener('hashchange', handleHashChange);

// Filter & Search Step 1
const searchInput = document.getElementById('integration-search');
const categoryFilters = document.getElementById('category-filters');
let currentCategory = 'all';

function applyFilters() {
    const query = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.wizard-card');

    cards.forEach(card => {
        const cat = card.dataset.cat;
        const keywords = (card.dataset.keywords || '') + ' ' + (card.querySelector('.wizard-card-title')?.innerText || '');
        const matchCat = (currentCategory === 'all' || cat === currentCategory);
        const matchQuery = (!query || keywords.toLowerCase().includes(query));

        card.classList.toggle('hidden', !(matchCat && matchQuery));
    });
}

searchInput.addEventListener('input', applyFilters);

categoryFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    categoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    applyFilters();
});

// =========================================================
// Integration Panel Logic & APIs
// =========================================================

// 1. Custom Stream
document.getElementById('stream-form').addEventListener('submit', async ev => {
    ev.preventDefault();

    const url = new URL('api/streams', location.href);
    url.searchParams.set('name', ev.target.elements['name'].value);
    url.searchParams.set('src', ev.target.elements['src'].value);

    try {
        const r = await fetch(url, {method: 'PUT'});
        if (r.ok) {
            window.showToast(`Stream "${ev.target.elements['name'].value}" added successfully!`, 'success');
            ev.target.reset();
        } else {
            window.showToast('Failed to add stream: ' + await r.text(), 'error');
        }
    } catch (e) {
        window.showToast('Network error: ' + e.message, 'error');
    }
});

// 2. ONVIF
document.getElementById('onvif-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const url = new URL('api/onvif', location.href);
    url.searchParams.set('src', ev.target.elements['src'].value);
    await getSources('onvif-table', url.toString());
});
document.getElementById('btn-rescan-onvif').addEventListener('click', () => getSources('onvif-table', 'api/onvif'));

// 3. Apple HomeKit
async function reloadHomeKit() {
    await getSources('homekit-table', 'api/discovery/homekit');

    const rows = document.querySelectorAll('#homekit-table tr');
    rows.forEach((row, i) => {
        let commands = '';
        if (row.children[2]?.innerText.indexOf('status=1') > 0) {
            commands += '<button type="button" class="table-action-btn" data-action="pair">Pair</button>';
        } else if (i > 0 && row.children[3]?.innerText) {
            commands += '<button type="button" class="table-action-btn" data-action="unpair">Unpair</button>';
        }
        row.innerHTML += i > 0 ? `<td>${commands}</td>` : '<th>Actions</th>';
    });
}

document.getElementById('btn-rescan-homekit').addEventListener('click', reloadHomeKit);

document.getElementById('homekit-table').addEventListener('click', ev => {
    const btn = ev.target.closest('.table-action-btn');
    if (!btn) return;
    const row = btn.closest('tr');
    if (btn.dataset.action === 'pair') {
        const form = document.querySelector('#homekit-pair');
        form.elements['id'].value = row.children[0].innerText;
        form.elements['src'].value = row.children[2].innerText;
        form.scrollIntoView({behavior: 'smooth'});
        form.elements['pin'].focus();
    } else if (btn.dataset.action === 'unpair') {
        const form = document.querySelector('#homekit-unpair');
        form.elements['id'].value = row.children[3].innerText;
        form.scrollIntoView({behavior: 'smooth'});
    }
});

document.getElementById('homekit-pair').addEventListener('submit', async ev => {
    ev.preventDefault();
    const params = new URLSearchParams(new FormData(ev.target));
    try {
        const r = await fetch('api/homekit', {method: 'POST', body: params});
        if (r.ok) {
            window.showToast('HomeKit accessory paired successfully!', 'success');
            ev.target.reset();
        } else {
            window.showToast('Failed to pair HomeKit: ' + await r.text(), 'error');
        }
    } catch (e) {
        window.showToast('Pairing error: ' + e.message, 'error');
    }
    await reloadHomeKit();
});

document.getElementById('homekit-unpair').addEventListener('submit', async ev => {
    ev.preventDefault();
    const params = new URLSearchParams(new FormData(ev.target));
    try {
        const r = await fetch('api/homekit?' + params.toString(), {method: 'DELETE'});
        if (r.ok) {
            window.showToast('HomeKit accessory unpaired.', 'info');
            ev.target.reset();
        } else {
            window.showToast('Failed to unpair HomeKit: ' + await r.text(), 'error');
        }
    } catch (e) {
        window.showToast('Unpairing error: ' + e.message, 'error');
    }
    await reloadHomeKit();
});

// 4. USB Devices
document.getElementById('btn-rescan-devices').addEventListener('click', () => getSources('devices-table', 'api/ffmpeg/devices'));

// 5. Hardware
document.getElementById('btn-rescan-hardware').addEventListener('click', () => getSources('hardware-table', 'api/ffmpeg/hardware'));

// 6. Home Assistant
document.getElementById('btn-rescan-hass').addEventListener('click', () => getSources('hass-table', 'api/hass'));

// 7. Ring
function findRingCredentialsFromStreams() {
    for (const urls of knownStreams.values()) {
        for (const u of urls) {
            if (u && (u.startsWith('ring:') || u.startsWith('ring://'))) {
                try {
                    const queryPart = u.includes('?') ? u.slice(u.indexOf('?') + 1) : '';
                    const params = new URLSearchParams(queryPart);
                    const token = params.get('refresh_token');
                    if (token) return { refreshToken: token };
                } catch (e) {}
            }
        }
    }
    return null;
}

async function ringReload() {
    const creds = findRingCredentialsFromStreams();
    if (creds && creds.refreshToken) {
        const tokenForm = document.getElementById('ring-token-form');
        if (tokenForm) {
            const input = tokenForm.querySelector('[name="refresh_token"]');
            if (input) input.value = creds.refreshToken;

            let banner = document.getElementById('ring-account-status');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'ring-account-status';
                banner.className = 'account-status-banner';
                tokenForm.parentNode.insertBefore(banner, tokenForm);
            }
            banner.innerHTML = `
                <div class="account-status-badge">
                    <span class="status-dot"></span>
                    <span>Configured in Active Streams: <strong>Ring Refresh Token Detected</strong></span>
                </div>
            `;
        }
        const table = document.getElementById('ring-table');
        if (table) {
            table.innerHTML = `<tbody><tr><td colspan="5" class="table-loading"><div class="table-loading-spinner"></div><span>Discovering Ring cameras...</span></td></tr></tbody>`;
            try {
                const r = await fetch('api/ring?refresh_token=' + encodeURIComponent(creds.refreshToken), {cache: 'no-cache'});
                if (r.ok) {
                    const data = await r.json();
                    if (!data.needs_2fa) {
                        await drawTable(table, data);
                    }
                } else {
                    table.innerHTML = `<tbody><tr><td colspan="5" class="table-error-cell">Ring error: ${await r.text()}</td></tr></tbody>`;
                }
            } catch (e) {
                table.innerHTML = `<tbody><tr><td colspan="5" class="table-error-cell">Network error: ${e.message}</td></tr></tbody>`;
            }
        }
    }
}

async function handleRingAuth(ev) {
    ev.preventDefault();
    const table = document.getElementById('ring-table');
    table.innerHTML = `<tbody><tr><td colspan="5" class="table-loading"><div class="table-loading-spinner"></div><span>Authenticating with Ring...</span></td></tr></tbody>`;

    const query = new URLSearchParams(new FormData(ev.target));
    const url = new URL('api/ring?' + query.toString(), location.href);

    try {
        const r = await fetch(url, {cache: 'no-cache'});
        if (!r.ok) {
            table.innerHTML = `<tbody><tr><td colspan="5" class="table-error-cell">Error: ${(await r.text()) || 'Ring authentication failed'}</td></tr></tbody>`;
            return;
        }
        const data = await r.json();
        if (data.needs_2fa) {
            document.getElementById('tfa-field').classList.remove('hidden');
            document.getElementById('tfa-prompt').textContent = data.prompt || 'Enter 2FA verification code';
            table.innerHTML = `<tbody><tr><td colspan="5" class="table-info-cell">2FA code required. Check your phone and enter code above.</td></tr></tbody>`;
            return;
        }
        await drawTable(table, data);
    } catch (e) {
        table.innerHTML = `<tbody><tr><td colspan="5" class="table-error-cell">Network error: ${e.message}</td></tr></tbody>`;
    }
}

document.getElementById('ring-credentials-form').addEventListener('submit', handleRingAuth);
document.getElementById('ring-token-form').addEventListener('submit', handleRingAuth);

// 8. Nest
function findNestCredentialsFromStreams() {
    for (const urls of knownStreams.values()) {
        for (const u of urls) {
            if (u && (u.startsWith('nest:') || u.startsWith('nest://'))) {
                try {
                    const queryPart = u.includes('?') ? u.slice(u.indexOf('?') + 1) : '';
                    const params = new URLSearchParams(queryPart);
                    const clientId = params.get('client_id');
                    const clientSecret = params.get('client_secret');
                    const refreshToken = params.get('refresh_token');
                    const projectId = params.get('project_id');
                    if (clientId && refreshToken && projectId) {
                        return { clientId, clientSecret, refreshToken, projectId };
                    }
                } catch (e) {}
            }
        }
    }
    return null;
}

async function nestReload() {
    const creds = findNestCredentialsFromStreams();
    if (creds) {
        const form = document.getElementById('nest-form');
        if (form) {
            if (creds.clientId) form.querySelector('[name="client_id"]').value = creds.clientId;
            if (creds.clientSecret) form.querySelector('[name="client_secret"]').value = creds.clientSecret;
            if (creds.refreshToken) form.querySelector('[name="refresh_token"]').value = creds.refreshToken;
            if (creds.projectId) form.querySelector('[name="project_id"]').value = creds.projectId;

            let banner = document.getElementById('nest-account-status');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'nest-account-status';
                banner.className = 'account-status-banner';
                form.parentNode.insertBefore(banner, form);
            }
            banner.innerHTML = `
                <div class="account-status-badge">
                    <span class="status-dot"></span>
                    <span>Configured in Active Streams: Project <strong>${escapeHtml(creds.projectId)}</strong></span>
                </div>
                <button type="button" class="btn btn-sm btn-secondary" id="btn-nest-edit-toggle">Edit Credentials</button>
            `;
            form.classList.add('account-configured-collapsed');
            const toggleBtn = banner.querySelector('#btn-nest-edit-toggle');
            if (toggleBtn) {
                toggleBtn.onclick = () => {
                    const isCollapsed = form.classList.toggle('account-configured-collapsed');
                    toggleBtn.textContent = isCollapsed ? 'Edit Credentials' : 'Hide Form';
                };
            }
        }
        const params = new URLSearchParams({
            client_id: creds.clientId,
            client_secret: creds.clientSecret || '',
            refresh_token: creds.refreshToken,
            project_id: creds.projectId
        });
        await getSources('nest-table', 'api/nest?' + params.toString());
    }
}

document.getElementById('nest-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const query = new URLSearchParams(new FormData(ev.target));
    const url = new URL('api/nest?' + query.toString(), location.href);
    const r = await fetch(url, {cache: 'no-cache'});
    await getSources('nest-table', r);
});

// 9. Tuya
function findTuyaCredentialsFromStreams() {
    for (const urls of knownStreams.values()) {
        for (const u of urls) {
            if (u && u.startsWith('tuya://')) {
                try {
                    const parsed = new URL(u);
                    const email = parsed.searchParams.get('email');
                    const password = parsed.searchParams.get('password');
                    const region = parsed.hostname;
                    if (email && password) {
                        return { email, password, region };
                    }
                } catch (e) {}
            }
        }
    }
    return null;
}

function prefillTuyaAccount(creds, isTopLevel = false) {
    const form = document.getElementById('tuya-credentials-form');
    if (!form || !creds) return;

    if (creds.region) {
        const r = form.querySelector('[name="region"]');
        if (r) r.value = creds.region;
    }
    if (creds.email) {
        const e = form.querySelector('[name="email"]');
        if (e) e.value = creds.email;
    }
    const p = form.querySelector('[name="password"]');
    if (p) {
        if (isTopLevel) {
            p.placeholder = '•••••••• (Saved in config)';
            p.required = false;
        } else if (creds.password) {
            p.value = creds.password;
        }
    }

    let banner = document.getElementById('tuya-account-status');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'tuya-account-status';
        banner.className = 'account-status-banner';
        form.parentNode.insertBefore(banner, form);
    }
    const label = isTopLevel ? 'Configured Account' : 'Configured in Active Streams';
    banner.innerHTML = `
        <div class="account-status-badge">
            <span class="status-dot"></span>
            <span>${label}: <strong>${escapeHtml(creds.email)}</strong> (${escapeHtml(creds.region || 'EU')})</span>
        </div>
        <button type="button" class="btn btn-sm btn-secondary" id="btn-tuya-edit-toggle">Edit Account</button>
    `;

    form.classList.add('account-configured-collapsed');
    const toggleBtn = banner.querySelector('#btn-tuya-edit-toggle');
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const isCollapsed = form.classList.toggle('account-configured-collapsed');
            toggleBtn.textContent = isCollapsed ? 'Edit Account' : 'Hide Form';
        };
    }
}

async function tuyaReload() {
    try {
        const r = await fetch('api/tuya', {cache: 'no-cache'});
        if (r.ok) {
            const data = await r.json();
            if (Array.isArray(data)) {
                if (data.length > 0 && typeof data[0] === 'string') {
                    const selectCard = document.getElementById('tuya-select-card');
                    const users = document.getElementById('tuya-id');
                    if (selectCard && users) {
                        selectCard.style.display = '';
                        users.innerHTML = data.map(i => `<option value="${i}">${i}</option>`).join('');
                    }
                    const r0 = await fetch('api/tuya?id=' + encodeURIComponent(data[0]), {cache: 'no-cache'});
                    if (r0.ok) {
                        const d0 = await r0.json();
                        if (d0.sources) await drawTable(document.getElementById('tuya-table'), d0);
                        if (d0.account) prefillTuyaAccount(d0.account, true);
                    }
                    return;
                }
            } else if (data && data.sources) {
                await drawTable(document.getElementById('tuya-table'), data);
                if (data.account) {
                    prefillTuyaAccount(data.account, true);
                }
                return;
            }
        }
    } catch (e) {
        console.warn('tuya reload error:', e);
    }

    // Fallback: search active streams
    const creds = findTuyaCredentialsFromStreams();
    if (creds) {
        prefillTuyaAccount(creds, false);
        const url = new URL('api/tuya', location.href);
        url.searchParams.set('region', creds.region);
        url.searchParams.set('email', creds.email);
        url.searchParams.set('password', creds.password);
        await getSources('tuya-table', url.toString());
    }
}

document.getElementById('tuya-credentials-form')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const params = new URLSearchParams(new FormData(ev.target));
    try {
        const r = await fetch('api/tuya', {method: 'POST', body: params});
        if (!r.ok) {
            const txt = await r.text();
            window.showToast('Tuya login failed: ' + txt, 'error');
            return;
        }
        const data = await r.json();
        if (data && data.sources) {
            await drawTable(document.getElementById('tuya-table'), data);
        }
        if (data && data.account) {
            prefillTuyaAccount(data.account, true);
        }
        if (data && data.is_existing) {
            window.showToast('Account already in config. Discovered cameras.', 'info');
        } else {
            window.showToast('Tuya login successful! Saved to config.', 'success');
        }
    } catch (e) {
        window.showToast('Tuya error: ' + e.message, 'error');
    }
});

document.getElementById('tuya-id')?.addEventListener('change', async (ev) => {
    const val = ev.target.value;
    if (!val) return;
    try {
        const r = await fetch('api/tuya?id=' + encodeURIComponent(val), {cache: 'no-cache'});
        if (r.ok) {
            const d = await r.json();
            if (d.sources) await drawTable(document.getElementById('tuya-table'), d);
            if (d.account) prefillTuyaAccount(d.account, true);
        }
    } catch (e) {}
});

document.getElementById('tuya-devices-form')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const val = document.getElementById('tuya-id')?.value;
    if (!val) return;
    try {
        const r = await fetch('api/tuya?id=' + encodeURIComponent(val), {cache: 'no-cache'});
        if (r.ok) {
            const d = await r.json();
            if (d.sources) await drawTable(document.getElementById('tuya-table'), d);
            if (d.account) prefillTuyaAccount(d.account, true);
        }
    } catch (e) {}
});

// Arenti
function prefillArentiAccount(acc) {
    const form = document.getElementById('arenti-login-form');
    if (!form || !acc) return;

    if (acc.username) {
        const u = form.querySelector('[name="username"]');
        if (u) u.value = acc.username;
    }
    if (acc.country_code) {
        const c = form.querySelector('[name="country_code"]');
        if (c) c.value = acc.country_code;
    }
    if (acc.region) {
        const r = form.querySelector('[name="region"]');
        if (r) r.value = acc.region;
    }
    const p = form.querySelector('[name="password"]');
    if (p) {
        p.placeholder = '•••••••• (Saved in config)';
        p.required = false;
    }

    let banner = document.getElementById('arenti-account-status');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'arenti-account-status';
        banner.className = 'account-status-banner';
        form.parentNode.insertBefore(banner, form);
    }
    banner.innerHTML = `
        <div class="account-status-badge">
            <span class="status-dot"></span>
            <span>Configured Account: <strong>${escapeHtml(acc.username)}</strong> (${escapeHtml(acc.country_code || 'US')})</span>
        </div>
        <button type="button" class="btn btn-sm btn-secondary" id="btn-arenti-edit-toggle">Edit Account</button>
    `;

    form.classList.add('account-configured-collapsed');
    const toggleBtn = banner.querySelector('#btn-arenti-edit-toggle');
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const isCollapsed = form.classList.toggle('account-configured-collapsed');
            toggleBtn.textContent = isCollapsed ? 'Edit Account' : 'Hide Form';
        };
    }
}

async function arentiReload() {
    try {
        const r = await fetch('api/arenti', {cache: 'no-cache'});
        if (!r.ok) return;
        const data = await r.json();
        if (Array.isArray(data)) {
            if (data.length > 0 && typeof data[0] === 'string') {
                const selectCard = document.getElementById('arenti-select-card');
                const users = document.getElementById('arenti-id');
                if (selectCard && users) {
                    selectCard.style.display = '';
                    users.innerHTML = data.map(i => `<option value="${i}">${i}</option>`).join('');
                }
                const r0 = await fetch('api/arenti?id=' + encodeURIComponent(data[0]), {cache: 'no-cache'});
                if (r0.ok) {
                    const d0 = await r0.json();
                    if (d0.sources) await drawTable(document.getElementById('arenti-table'), d0);
                    if (d0.account) prefillArentiAccount(d0.account);
                }
            }
        } else if (data && data.sources) {
            await drawTable(document.getElementById('arenti-table'), data);
            if (data.account) {
                prefillArentiAccount(data.account);
            }
        }
    } catch (e) {
        console.warn('arenti reload error:', e);
    }
}

document.getElementById('arenti-id')?.addEventListener('change', async (ev) => {
    const val = ev.target.value;
    if (!val) return;
    try {
        const r = await fetch('api/arenti?id=' + encodeURIComponent(val), {cache: 'no-cache'});
        if (r.ok) {
            const d = await r.json();
            if (d.sources) await drawTable(document.getElementById('arenti-table'), d);
            if (d.account) prefillArentiAccount(d.account);
        }
    } catch (e) {}
});

document.getElementById('arenti-login-form')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const params = new URLSearchParams(new FormData(ev.target));
    try {
        const r = await fetch('api/arenti', {method: 'POST', body: params});
        if (!r.ok) {
            const txt = await r.text();
            window.showToast('Arenti login failed: ' + txt, 'error');
            return;
        }
        const data = await r.json();
        if (data && data.sources) {
            await drawTable(document.getElementById('arenti-table'), data);
        }
        if (data && data.account) {
            prefillArentiAccount(data.account);
        }
        if (data && data.is_existing) {
            window.showToast('Account already in config. Discovered cameras.', 'info');
        } else {
            window.showToast('Arenti login successful! Discovered cameras.', 'success');
        }
    } catch (e) {
        window.showToast('Arenti error: ' + e.message, 'error');
    }
});

document.getElementById('arenti-devices-form')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const params = new URLSearchParams(new FormData(ev.target));
    await getSources('arenti-table', 'api/arenti?' + params.toString());
});

// 10. Wyze
function prefillWyzeAccount(email) {
    const form = document.getElementById('wyze-login-form');
    if (!form || !email) return;

    const emailInput = form.querySelector('[name="email"]');
    if (emailInput) emailInput.value = email;

    const passInput = form.querySelector('[name="password"]');
    if (passInput) {
        passInput.placeholder = '•••••••• (Saved in config)';
        passInput.required = false;
    }
    const apiIdInput = form.querySelector('[name="api_id"]');
    if (apiIdInput) apiIdInput.required = false;
    const apiKeyInput = form.querySelector('[name="api_key"]');
    if (apiKeyInput) apiKeyInput.required = false;

    let banner = document.getElementById('wyze-account-status');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'wyze-account-status';
        banner.className = 'account-status-banner';
        form.parentNode.insertBefore(banner, form);
    }
    banner.innerHTML = `
        <div class="account-status-badge">
            <span class="status-dot"></span>
            <span>Configured Account: <strong>${escapeHtml(email)}</strong></span>
        </div>
        <button type="button" class="btn btn-sm btn-secondary" id="btn-wyze-edit-toggle">Edit Account</button>
    `;

    form.classList.add('account-configured-collapsed');
    const toggleBtn = banner.querySelector('#btn-wyze-edit-toggle');
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const isCollapsed = form.classList.toggle('account-configured-collapsed');
            toggleBtn.textContent = isCollapsed ? 'Edit Account' : 'Hide Form';
        };
    }
}

async function wyzeReload() {
    try {
        const r = await fetch('api/wyze', {cache: 'no-cache'});
        if (r.ok) {
            const data = await r.json();
            const users = document.getElementById('wyze-id');
            if (users && Array.isArray(data)) {
                users.innerHTML = data.map(item => `<option value="${item}">${item}</option>`).join('');
                if (data.length > 0) {
                    prefillWyzeAccount(data[0]);
                    await getSources('wyze-table', 'api/wyze?id=' + encodeURIComponent(data[0]));
                }
            }
        }
    } catch (e) {}
}

document.getElementById('wyze-id')?.addEventListener('change', async (ev) => {
    const val = ev.target.value;
    if (!val) return;
    prefillWyzeAccount(val);
    await getSources('wyze-table', 'api/wyze?id=' + encodeURIComponent(val));
});

document.getElementById('wyze-login-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const params = new URLSearchParams(new FormData(ev.target));
    const r = await fetch('api/wyze', {method: 'POST', body: params});
    if (r.ok) {
        window.showToast('Wyze login successful!', 'success');
        const data = await r.json();
        await drawTable(document.getElementById('wyze-table'), data);
        wyzeReload();
    } else {
        window.showToast('Wyze error: ' + await r.text(), 'error');
    }
});

document.getElementById('wyze-devices-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const params = new URLSearchParams(new FormData(ev.target));
    await getSources('wyze-table', 'api/wyze?' + params.toString());
});

// 11. Xiaomi
function prefillXiaomiAccount(userID) {
    const form = document.getElementById('xiaomi-login-form');
    if (!form || !userID) return;

    let banner = document.getElementById('xiaomi-account-status');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'xiaomi-account-status';
        banner.className = 'account-status-banner';
        form.parentNode.insertBefore(banner, form);
    }
    banner.innerHTML = `
        <div class="account-status-badge">
            <span class="status-dot"></span>
            <span>Configured Account: User ID <strong>${escapeHtml(userID)}</strong></span>
        </div>
        <button type="button" class="btn btn-sm btn-secondary" id="btn-xiaomi-edit-toggle">Add / Re-login Account</button>
    `;

    form.classList.add('account-configured-collapsed');
    const toggleBtn = banner.querySelector('#btn-xiaomi-edit-toggle');
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const isCollapsed = form.classList.toggle('account-configured-collapsed');
            toggleBtn.textContent = isCollapsed ? 'Add / Re-login Account' : 'Hide Form';
        };
    }
}

function findXiaomiCredentialsFromStreams() {
    for (const urls of knownStreams.values()) {
        for (const u of urls) {
            if (u && (u.startsWith('xiaomi://') || u.startsWith('xiaomi:'))) {
                try {
                    const parsed = new URL(u);
                    const userID = parsed.username;
                    const region = parsed.password;
                    if (userID) return { userID, region };
                } catch (e) {}
            }
        }
    }
    return null;
}

async function xiaomiReload() {
    document.getElementById('xiaomi-login-form').classList.remove('hidden');
    document.getElementById('xiaomi-captcha-form').classList.add('hidden');
    document.getElementById('xiaomi-verify-form').classList.add('hidden');

    try {
        const r = await fetch('api/xiaomi', {cache: 'no-cache'});
        if (r.ok) {
            const data = await r.json();
            const users = document.getElementById('xiaomi-id');
            if (users && Array.isArray(data)) {
                users.innerHTML = data.map(item => `<option value="${item}">${item}</option>`).join('');
                if (data.length > 0) {
                    prefillXiaomiAccount(data[0]);
                    const regionSelect = document.querySelector('#xiaomi-devices-form [name="region"]');
                    const region = regionSelect ? regionSelect.value : 'cn';
                    await getSources('xiaomi-table', `api/xiaomi?id=${encodeURIComponent(data[0])}&region=${encodeURIComponent(region)}`);
                    return;
                }
            }
        }
    } catch (e) {}

    const creds = findXiaomiCredentialsFromStreams();
    if (creds && creds.userID) {
        prefillXiaomiAccount(creds.userID);
        if (creds.region) {
            const regionSelect = document.querySelector('#xiaomi-devices-form [name="region"]');
            if (regionSelect) regionSelect.value = creds.region;
        }
    }
}

document.getElementById('xiaomi-id')?.addEventListener('change', async (ev) => {
    const val = ev.target.value;
    if (!val) return;
    prefillXiaomiAccount(val);
    const regionSelect = document.querySelector('#xiaomi-devices-form [name="region"]');
    const region = regionSelect ? regionSelect.value : 'cn';
    await getSources('xiaomi-table', `api/xiaomi?id=${encodeURIComponent(val)}&region=${encodeURIComponent(region)}`);
});

async function xiaomiLogin(ev) {
    ev.preventDefault();
    const params = new URLSearchParams(new FormData(ev.target));
    const r = await fetch('api/xiaomi', {method: 'POST', body: params});
    if (r.status === 401) {
        const data = await r.json();
        document.getElementById('xiaomi-login-form').classList.add('hidden');
        if (data.captcha) {
            document.getElementById('xiaomi-captcha-form').classList.remove('hidden');
            document.getElementById('xiaomi-captcha').src = 'data:image/jpeg;base64,' + data.captcha;
        } else {
            document.getElementById('xiaomi-verify-form').classList.remove('hidden');
            document.getElementById('xiaomi-verify').innerText = data.verify_email || data.verify_phone;
        }
    } else if (r.ok) {
        window.showToast('Xiaomi login successful!', 'success');
        xiaomiReload();
    } else {
        window.showToast('Xiaomi error: ' + await r.text(), 'error');
    }
}

document.getElementById('xiaomi-login-form').addEventListener('submit', xiaomiLogin);
document.getElementById('xiaomi-captcha-form').addEventListener('submit', xiaomiLogin);
document.getElementById('xiaomi-verify-form').addEventListener('submit', xiaomiLogin);

document.getElementById('xiaomi-devices-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const params = new URLSearchParams(new FormData(ev.target));
    await getSources('xiaomi-table', 'api/xiaomi?' + params.toString());
});

// 12. Roborock
async function roborockReload() {
    try {
        const r = await fetch('api/roborock', {cache: 'no-cache'});
        if (r.ok) {
            const form = document.getElementById('roborock-form');
            if (form) {
                let banner = document.getElementById('roborock-account-status');
                if (!banner) {
                    banner = document.createElement('div');
                    banner.id = 'roborock-account-status';
                    banner.className = 'account-status-banner';
                    form.parentNode.insertBefore(banner, form);
                }
                banner.innerHTML = `
                    <div class="account-status-badge">
                        <span class="status-dot"></span>
                        <span>Active Session: <strong>Roborock Vacuum Connected</strong></span>
                    </div>
                `;
                form.classList.add('account-configured-collapsed');
            }
            await getSources('roborock-table', r);
        }
    } catch (e) {}
}

document.getElementById('roborock-form').addEventListener('submit', async ev => {
    ev.preventDefault();
    const r = await fetch('api/roborock', {method: 'POST', body: new FormData(ev.target)});
    await getSources('roborock-table', r);
});

// 13-17. Simple Scanners
document.getElementById('btn-rescan-dvrip').addEventListener('click', () => getSources('dvrip-table', 'api/dvrip'));
document.getElementById('btn-rescan-gopro').addEventListener('click', () => getSources('gopro-table', 'api/gopro'));
document.getElementById('btn-rescan-v4l2').addEventListener('click', () => getSources('v4l2-table', 'api/v4l2'));
document.getElementById('btn-rescan-alsa').addEventListener('click', () => getSources('alsa-table', 'api/alsa'));
document.getElementById('btn-rescan-webtorrent').addEventListener('click', () => getSources('webtorrent-table', 'api/webtorrent'));

// Initialize on load
handleHashChange();


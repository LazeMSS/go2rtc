const src = new URLSearchParams(location.search).get('src')?.replace(/[<">]/g, '') || '';
document.getElementById('stream-name-display').textContent = src || '(none)';

if (!src) {
    document.querySelector('.modern-main').innerHTML = `
        <div class="form-card card-empty-warning">
            <h2 class="text-danger">No Stream Specified</h2>
            <p class="subtext-spaced">Please provide a ?src=stream_name parameter to view links.</p>
            <div><a href="index.html" class="btn btn-primary">Back to Streams</a></div>
        </div>
    `;
}

document.getElementById('btn-open-stream').href = `stream.html?src=${encodeURIComponent(src)}`;
document.getElementById('btn-open-api').href = `api/streams?src=${encodeURIComponent(src)}`;

function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            window.showToast('Copied to clipboard!', 'success', 2000);
        }).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
        window.showToast('Copied to clipboard!', 'success', 2000);
    } catch (err) {
        window.showToast('Failed to copy text', 'error');
    }
    document.body.removeChild(textarea);
}

function renderLinkItem(container, { badge, badgeClass, name, url, desc, openBlank = false }) {
    const fullUrl = new URL(url, location.href).href;
    const item = document.createElement('div');
    item.className = 'link-item-row';
    item.innerHTML = `
        <div class="link-item-left">
            <span class="link-proto-badge ${badgeClass}">${badge}</span>
            <div class="link-meta">
                <a href="${url}" class="link-name-anchor" ${openBlank ? 'target="_blank"' : ''}>${name}</a>
                <span class="link-desc-text">${desc}</span>
            </div>
        </div>
        <div class="link-item-right">
            <button type="button" class="btn-icon-copy" title="Copy URL to clipboard" data-url="${fullUrl}">
                <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
        </div>
    `;
    item.querySelector('.btn-icon-copy').addEventListener('click', () => copyTextToClipboard(fullUrl));
    container.appendChild(item);
}

// Populate Web Players
const playersList = document.getElementById('player-links-list');
renderLinkItem(playersList, {
    badge: 'AUTO',
    badgeClass: 'proto-api',
    name: `stream.html?src=${src}`,
    url: `stream.html?src=${encodeURIComponent(src)}`,
    desc: 'Adaptive multi-protocol player with automatic protocol negotiation / Codecs: any'
});
renderLinkItem(playersList, {
    badge: 'WEBRTC',
    badgeClass: 'proto-webrtc',
    name: `stream.html?src=${src}&mode=webrtc`,
    url: `stream.html?src=${encodeURIComponent(src)}&mode=webrtc`,
    desc: 'Ultra low-latency WebRTC streaming (< 300ms) / Codecs: H264, OPUS, PCMA, PCMU (+H265 in Safari)'
});
renderLinkItem(playersList, {
    badge: 'MSE',
    badgeClass: 'proto-mse',
    name: `stream.html?src=${src}&mode=mse`,
    url: `stream.html?src=${encodeURIComponent(src)}&mode=mse`,
    desc: 'Media Source Extensions low-latency playback / Codecs: H264, H265, AAC, OPUS, PCM'
});
renderLinkItem(playersList, {
    badge: 'MJPEG',
    badgeClass: 'proto-mjpeg',
    name: `stream.html?src=${src}&mode=mjpeg`,
    url: `stream.html?src=${encodeURIComponent(src)}&mode=mjpeg`,
    desc: 'Motion JPEG image stream (universal compatibility) / Codecs: MJPEG, JPEG'
});

// Populate Direct Streams
const directList = document.getElementById('direct-links-list');
renderLinkItem(directList, {
    badge: 'MP4',
    badgeClass: 'proto-mp4',
    name: `api/stream.mp4?src=${src}`,
    url: `api/stream.mp4?src=${encodeURIComponent(src)}`,
    desc: 'Live fragmented MP4 stream / Compatible with Chrome, Firefox, Safari',
    openBlank: true
});
renderLinkItem(directList, {
    badge: 'MP4 FLAC',
    badgeClass: 'proto-mp4',
    name: `api/stream.mp4?src=${src}&mp4=flac`,
    url: `api/stream.mp4?src=${encodeURIComponent(src)}&mp4=flac`,
    desc: 'Modern MP4 stream with FLAC / Transcodes audio on the fly for broader browser support',
    openBlank: true
});
renderLinkItem(directList, {
    badge: 'HLS',
    badgeClass: 'proto-hls',
    name: `api/stream.m3u8?src=${src}`,
    url: `api/stream.m3u8?src=${encodeURIComponent(src)}`,
    desc: 'HTTP Live Streaming (MPEG-TS) playlist / Compatible with Apple devices, Safari, VLC',
    openBlank: true
});
renderLinkItem(directList, {
    badge: 'HLS fMP4',
    badgeClass: 'proto-hls',
    name: `api/stream.m3u8?src=${src}&mp4`,
    url: `api/stream.m3u8?src=${encodeURIComponent(src)}&mp4`,
    desc: 'Modern HLS with fragmented MP4 chunks / Low-latency HLS',
    openBlank: true
});
renderLinkItem(directList, {
    badge: 'MJPEG',
    badgeClass: 'proto-mjpeg',
    name: `api/stream.mjpeg?src=${src}`,
    url: `api/stream.mjpeg?src=${encodeURIComponent(src)}`,
    desc: 'Raw continuous multipart MJPEG stream / Compatible with Home Assistant, dashboards',
    openBlank: true
});
renderLinkItem(directList, {
    badge: 'JPEG SNAP',
    badgeClass: 'proto-api',
    name: `api/frame.jpeg?src=${src}`,
    url: `api/frame.jpeg?src=${encodeURIComponent(src)}`,
    desc: 'Single still JPEG snapshot image frame',
    openBlank: true
});
renderLinkItem(directList, {
    badge: 'MP4 SNAP',
    badgeClass: 'proto-mp4',
    name: `api/frame.mp4?src=${src}`,
    url: `api/frame.mp4?src=${encodeURIComponent(src)}`,
    desc: 'Single short MP4 snapshot frame clip',
    openBlank: true
});

// Populate RTSP endpoints dynamically from API
fetch('api', {cache: 'no-cache'}).then(r => r.json()).then(data => {
    let rtspHost = location.hostname + ':8554';
    try {
        const host = data.host.match(/^[^:]+/)[0];
        const port = data.rtsp.listen.match(/[0-9]+$/)[0];
        rtspHost = `${host}:${port}`;
    } catch (e) {}

    const rtspList = document.getElementById('rtsp-links-list');
    const rtspStandard = `rtsp://${rtspHost}/${src}`;
    const rtspMp4 = `rtsp://${rtspHost}/${src}?mp4`;
    const rtspAll = `rtsp://${rtspHost}/${src}?video=all&audio=all`;

    renderLinkItem(rtspList, {
        badge: 'RTSP',
        badgeClass: 'proto-rtsp',
        name: rtspStandard,
        url: rtspStandard,
        desc: 'Standard RTSP stream (1 video + 1 audio track) / Codecs: any'
    });
    renderLinkItem(rtspList, {
        badge: 'RTSP NVR',
        badgeClass: 'proto-rtsp',
        name: rtspMp4,
        url: rtspMp4,
        desc: 'RTSP optimized for Hass, Frigate, or NVR recording / Codecs: H264, H265, AAC'
    });
    renderLinkItem(rtspList, {
        badge: 'RTSP ALL',
        badgeClass: 'proto-rtsp',
        name: rtspAll,
        url: rtspAll,
        desc: 'RTSP with all audio and video tracks passed through'
    });

    const ffplayCmd = `ffplay -fflags nobuffer -flags low_delay -rtsp_transport tcp "${rtspStandard}"`;
    document.getElementById('ffplay-cmd').textContent = ffplayCmd;
    document.getElementById('btn-copy-ffplay').addEventListener('click', () => copyTextToClipboard(ffplayCmd));
}).catch(() => {});

// HomeKit Server Detection
fetch(`api/homekit?id=${encodeURIComponent(src)}`, {cache: 'no-cache'}).then(async (r) => {
    if (!r.ok) return;
    const div = document.querySelector('#homekit');
    const metaDiv = document.querySelector('#homekit-meta');
    const data = await r.json();
    if (data.setup_code === undefined) return;

    div.classList.remove('hidden');
    metaDiv.innerHTML = `
        <div class="homekit-info-row">
            <strong>Setup Name:</strong> <code>${data.name}</code>
        </div>
        <div class="homekit-info-row">
            <strong>Setup Code:</strong> <code class="homekit-code-text">${data.setup_code}</code>
        </div>
        <p class="homekit-help-text">
            Scan this QR code with your iPhone or iPad in Apple Home app to pair this camera directly.
        </p>
        <div>
            <a href="api/homekit?id=${encodeURIComponent(src)}" target="_blank" class="btn btn-secondary btn-sm">HomeKit JSON Status</a>
        </div>
    `;

    const script = document.createElement('script');
    script.src = 'js/vendors/qrcode.min.js';
    script.async = true;
    script.onload = () => {
        try {
            /* global BigInt, QRCode */
            const categoryID = BigInt(data.category_id);
            const pin = BigInt(data.setup_code.replaceAll('-', ''));
            const payload = categoryID << BigInt(31) | BigInt(2 << 27) | pin;
            const setupURI = `X-HM://${payload.toString(36).toUpperCase().padStart(9, '0')}${data.setup_id}`;
            new QRCode('homekit-qrcode', {text: setupURI, width: 128, height: 128});
        } catch (err) {}
    };
    document.head.appendChild(script);
});

// Two-Way Audio Player
document.getElementById('play-send').addEventListener('click', async (ev) => {
    ev.preventDefault();
    const action = document.querySelector('input[name="play"]:checked').value;
    const targetValue = document.getElementById('play-url').value.trim();

    if (!targetValue) {
        window.showToast('Please enter an audio URL or text to play.', 'warning');
        return;
    }

    const url = new URL('api/ffmpeg', location.href);
    url.searchParams.set('dst', src);
    url.searchParams.set(action, targetValue);

    try {
        const r = await fetch(url, {method: 'POST'});
        if (r.ok) {
            window.showToast('Audio playback request sent to camera!', 'success');
        } else {
            window.showToast('Failed to play audio: ' + await r.text(), 'error');
        }
    } catch (e) {
        window.showToast('Network error: ' + e.message, 'error');
    }
});

// Publish Stream
document.getElementById('pub-send').addEventListener('click', async (ev) => {
    ev.preventDefault();
    const dst = document.getElementById('pub-url').value.trim();
    if (!dst) {
        window.showToast('Please enter a destination RTMPS URL.', 'warning');
        return;
    }

    const url = new URL('api/streams', location.href);
    url.searchParams.set('src', src);
    url.searchParams.set('dst', dst);

    try {
        const r = await fetch(url, {method: 'POST'});
        if (r.ok) {
            window.showToast('Stream publishing initiated successfully!', 'success');
        } else {
            window.showToast('Failed to publish stream: ' + await r.text(), 'error');
        }
    } catch (e) {
        window.showToast('Network error: ' + e.message, 'error');
    }
});

// WebRTC Magic & WebTorrent Share
function webrtcLinksUpdate() {
    const media = document.querySelector('input[name="webrtc"]:checked').value;
    const direction = media.indexOf('video') >= 0 || media === 'audio' ? 'src' : 'dst';
    document.getElementById('local').href = `webrtc.html?${direction}=${encodeURIComponent(src)}&media=${encodeURIComponent(media)}`;

    const share = document.getElementById('shareget');
    if (share.dataset.auth) {
        share.dataset.shareUrl = `https://go2rtc.org/webtorrent/#${share.dataset.auth}&media=${encodeURIComponent(media)}`;
    }
}

function share(method) {
    const url = new URL('api/webtorrent', location.href);
    url.searchParams.set('src', src);
    return fetch(url, {method: method, cache: 'no-cache'});
}

function onshareadd(r) {
    const shareBtn = document.getElementById('shareget');
    shareBtn.dataset.auth = `share=${r.share}&pwd=${r.pwd}`;
    document.getElementById('shareadd').classList.add('hidden');
    shareBtn.classList.remove('hidden');
    document.getElementById('sharedel').classList.remove('hidden');
    webrtcLinksUpdate();
}

function onsharedel() {
    document.getElementById('shareadd').classList.remove('hidden');
    document.getElementById('shareget').classList.add('hidden');
    document.getElementById('sharedel').classList.add('hidden');
}

document.getElementById('shareadd').addEventListener('click', async (ev) => {
    ev.preventDefault();
    try {
        const r = await share('POST');
        if (r.ok) {
            const data = await r.json();
            onshareadd(data);
            window.showToast('WebTorrent public share created!', 'success');
        } else {
            window.showToast('Failed to create share: ' + await r.text(), 'error');
        }
    } catch (e) {
        window.showToast('Network error: ' + e.message, 'error');
    }
});

document.getElementById('shareget').addEventListener('click', (ev) => {
    ev.preventDefault();
    const url = ev.currentTarget.dataset.shareUrl;
    if (url) {
        copyTextToClipboard(url);
    }
});

document.getElementById('sharedel').addEventListener('click', async (ev) => {
    ev.preventDefault();
    try {
        const r = await share('DELETE');
        if (r.ok) {
            onsharedel();
            window.showToast('Public share deleted.', 'info');
        }
    } catch (e) {}
});

document.getElementById('webrtc-modes').addEventListener('click', (ev) => {
    const chip = ev.target.closest('.mode-chip');
    if (chip) {
        document.querySelectorAll('#webrtc-modes .mode-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        webrtcLinksUpdate();
    }
});

share('GET').then(r => {
    if (r.ok) r.json().then(data => onshareadd(data));
    else onsharedel();
}).catch(() => onsharedel());

webrtcLinksUpdate();


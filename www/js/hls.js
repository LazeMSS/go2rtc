const params = new URLSearchParams(location.search);
const streamName = params.get('src') || 'HLS Stream';

if (params.get('header') === 'false' || params.get('nav') === 'false' || params.get('nav') === '0') {
    document.getElementById('stream-nav').classList.add('hidden');
}

document.title = `${streamName} (HLS) - go2rtc`;
document.getElementById('nav-title').textContent = streamName;

const frame = document.getElementById('stream-frame');
const video = document.getElementById('video');

if (params.get('src')) {
    frame.src = params.get('src');
    frame.title = streamName;
    document.getElementById('btn-back').href = `links.html?src=${encodeURIComponent(params.get('src'))}`;
} else {
    frame.title = streamName;
}

document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
});

document.getElementById('btn-reconnect').addEventListener('click', () => {
    location.reload();
});

video.addEventListener('playing', () => {
    frame.setBadge('HLS LIVE', 'success', 'Connected via HLS');
});

video.addEventListener('error', () => {
    frame.setBadge('ERROR', 'error', 'HLS playback error');
    window.showToast('HLS playback error', 'error');
});

const url = new URL('api/stream.m3u8' + location.search, location.href);

/* global Hls */
if (window.Hls && Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url.toString());
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
            frame.setBadge('ERROR', 'error', 'HLS fatal error');
            window.showToast('HLS fatal stream error', 'error');
        }
    });
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url.toString();
}

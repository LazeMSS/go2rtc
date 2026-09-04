const params = new URLSearchParams(location.search);
const streamName = params.get('src') || params.get('dst') || 'WebRTC Stream';
const media = params.get('media') || 'video+audio';

// Embed mode check: ?header=false or ?nav=false or ?nav=0 hides top navbar
if (params.get('header') === 'false' || params.get('nav') === 'false' || params.get('nav') === '0') {
    document.getElementById('stream-nav').classList.add('hidden');
}

// Set titles
const titleText = streamName;
document.title = `${titleText} (WebRTC Sync) - go2rtc`;
document.getElementById('nav-title').textContent = titleText;
document.getElementById('nav-mode').textContent = 'HTTP Sync • ' + media.replace(/\+/g, ' ');

const frame = document.getElementById('stream-frame');
const video = document.getElementById('video');

if (params.get('src')) {
    frame.src = params.get('src');
    frame.title = titleText;
    document.getElementById('btn-back').href = `links.html?src=${encodeURIComponent(params.get('src'))}`;
} else {
    frame.title = titleText;
}

// Global fullscreen button
document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
});

let currentPc = null;

async function PeerConnection(media) {
    const pc = new RTCPeerConnection({
        iceServers: [{urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302']}]
    });

    const localTracks = [];
    const audioTransceiver = pc.addTransceiver('audio', {direction: 'sendrecv'});
    const videoTransceiver = pc.addTransceiver('video', {direction: 'sendrecv'});
    localTracks.push(audioTransceiver.receiver.track, videoTransceiver.receiver.track);

    if (/camera|microphone/.test(media)) {
        try {
            const tracks = await navigator.mediaDevices.getUserMedia({
                video: media.indexOf('camera') >= 0,
                audio: media.indexOf('microphone') >= 0,
            });
            tracks.getTracks().forEach(track => pc.addTrack(track));
        } catch (err) {
            console.warn(err);
            window.showToast('Microphone/Camera access error: ' + err.message, 'warning');
        }
    }

    video.srcObject = new MediaStream(localTracks);

    pc.addEventListener('connectionstatechange', () => {
        if (pc.connectionState === 'connected') {
            if (media.indexOf('microphone') >= 0) {
                frame.setBadge('TWO-WAY AUDIO', 'success', 'Two-way audio connected');
            } else {
                frame.setBadge('RTC LIVE', 'success', 'Connected via WebRTC');
            }
            if (video.muted) {
                frame.showUnmute(true);
            }
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            frame.setBadge('DISCONNECTED', 'error', 'WebRTC disconnected');
        }
    });

    return pc;
}

function getCompleteOffer(pc, timeout) {
    return new Promise((resolve) => {
        pc.addEventListener('icegatheringstatechange', () => {
            if (pc.iceGatheringState === 'complete') resolve(pc.localDescription.sdp);
        });

        pc.createOffer().then(offer => pc.setLocalDescription(offer));

        setTimeout(() => resolve(pc.localDescription.sdp), timeout || 3000);
    });
}

async function connect() {
    if (currentPc) {
        currentPc.close();
        currentPc = null;
    }

    frame.setBadge('CONNECTING', 'info', 'Establishing WebRTC session...');

    try {
        const pc = await PeerConnection(media);
        currentPc = pc;

        const url = new URL('api/webrtc' + location.search, location.href);
        const r = await fetch(url, {method: 'POST', body: await getCompleteOffer(pc)});

        if (!r.ok) {
            frame.setBadge('FAILED', 'error', 'Server error');
            window.showToast('WebRTC server error: ' + await r.text(), 'error');
            return;
        }

        const answerSdp = await r.text();
        await pc.setRemoteDescription({type: 'answer', sdp: answerSdp});
    } catch (e) {
        frame.setBadge('ERROR', 'error', e.message);
        window.showToast('WebRTC connection failed: ' + e.message, 'error');
    }
}

document.getElementById('btn-reconnect').addEventListener('click', () => {
    connect();
    window.showToast('Reconnecting WebRTC stream...', 'info', 2000);
});

connect();

const params = new URLSearchParams(location.search);
const streamName = params.get('src') || params.get('dst') || 'WebRTC Stream';
const media = params.get('media') || 'video+audio';

// Embed mode check: ?header=false or ?nav=false or ?nav=0 hides top navbar
if (params.get('header') === 'false' || params.get('nav') === 'false' || params.get('nav') === '0') {
    document.getElementById('stream-nav').classList.add('hidden');
}

// Set titles
const titleText = streamName;
document.title = `${titleText} (WebRTC) - go2rtc`;
document.getElementById('nav-title').textContent = titleText;
document.getElementById('nav-mode').textContent = media.replace(/\+/g, ' • ');

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
let currentWs = null;

async function PeerConnection(media) {
    const pc = new RTCPeerConnection({
        iceServers: [{urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302']}]
    });

    const localTracks = [];

    if (/camera|microphone/.test(media)) {
        const tracks = await getMediaTracks('user', {
            video: media.indexOf('camera') >= 0,
            audio: media.indexOf('microphone') >= 0,
        });
        tracks.forEach(track => {
            pc.addTransceiver(track, {direction: 'sendonly'});
            if (track.kind === 'video') localTracks.push(track);
        });
    }

    if (media.indexOf('display') >= 0) {
        const tracks = await getMediaTracks('display', {
            video: true,
            audio: media.indexOf('speaker') >= 0,
        });
        tracks.forEach(track => {
            pc.addTransceiver(track, {direction: 'sendonly'});
            if (track.kind === 'video') localTracks.push(track);
        });
    }

    if (/video|audio/.test(media)) {
        const tracks = ['video', 'audio']
            .filter(kind => media.indexOf(kind) >= 0)
            .map(kind => pc.addTransceiver(kind, {direction: 'recvonly'}).receiver.track);
        localTracks.push(...tracks);
    }

    video.srcObject = new MediaStream(localTracks);

    pc.addEventListener('connectionstatechange', () => {
        if (pc.connectionState === 'connected') {
            if (media.indexOf('microphone') >= 0) {
                frame.setBadge('TWO-WAY AUDIO', 'success', 'Two-way audio connected');
            } else if (media.indexOf('camera') >= 0 || media.indexOf('display') >= 0) {
                frame.setBadge('BROADCASTING', 'success', 'Broadcasting media stream');
            } else {
                frame.setBadge('RTC LIVE', 'success', 'Connected via WebRTC');
            }
            if (video.muted && localTracks.some(t => t.kind === 'audio')) {
                frame.showUnmute(true);
            }
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            frame.setBadge('DISCONNECTED', 'error', 'WebRTC disconnected');
        }
    });

    return pc;
}

async function getMediaTracks(media, constraints) {
    try {
        const stream = media === 'user'
            ? await navigator.mediaDevices.getUserMedia(constraints)
            : await navigator.mediaDevices.getDisplayMedia(constraints);
        return stream.getTracks();
    } catch (e) {
        console.warn(e);
        window.showToast('Microphone or Camera access error: ' + e.message, 'warning');
        return [];
    }
}

async function connect(media) {
    if (currentPc) {
        currentPc.close();
        currentPc = null;
    }
    if (currentWs) {
        currentWs.close();
        currentWs = null;
    }

    frame.setBadge('CONNECTING', 'info', 'Establishing WebRTC session...');

    try {
        const pc = await PeerConnection(media);
        currentPc = pc;

        const url = new URL('api/ws' + location.search, location.href);
        const ws = new WebSocket('ws' + url.toString().substring(4));
        currentWs = ws;

        ws.addEventListener('open', () => {
            pc.addEventListener('icecandidate', ev => {
                if (!ev.candidate) return;
                const msg = {type: 'webrtc/candidate', value: ev.candidate.candidate};
                ws.send(JSON.stringify(msg));
            });

            pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => {
                const msg = {type: 'webrtc/offer', value: pc.localDescription.sdp};
                ws.send(JSON.stringify(msg));
            });
        });

        ws.addEventListener('message', ev => {
            const msg = JSON.parse(ev.data);
            if (msg.type === 'webrtc/candidate') {
                pc.addIceCandidate({candidate: msg.value, sdpMid: '0'});
            } else if (msg.type === 'webrtc/answer') {
                pc.setRemoteDescription({type: 'answer', sdp: msg.value});
            }
        });

        ws.addEventListener('error', () => {
            frame.setBadge('ERROR', 'error', 'WebSocket signaling error');
            window.showToast('WebSocket signaling error', 'error');
        });

        ws.addEventListener('close', () => {
            if (pc.connectionState !== 'connected') {
                frame.setBadge('OFFLINE', 'warning', 'WebRTC signaling closed');
            }
        });
    } catch (e) {
        frame.setBadge('FAILED', 'error', e.message);
        window.showToast('WebRTC setup failed: ' + e.message, 'error');
    }
}

document.getElementById('btn-reconnect').addEventListener('click', () => {
    connect(media);
    window.showToast('Reconnecting WebRTC stream...', 'info', 2000);
});

connect(media);

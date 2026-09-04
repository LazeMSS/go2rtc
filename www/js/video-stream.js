import {VideoRTC} from './video-rtc.js';

/**
 * Enhanced VideoStream player for go2rtc streaming application.
 * Dispatches 'statechange' events when streaming protocol or connection state changes.
 */
export class VideoStream extends VideoRTC {
    constructor() {
        super();
        this._currentMode = '';
        this._currentStatus = '';
    }

    get currentMode() {
        return this._currentMode;
    }

    get currentStatus() {
        return this._currentStatus;
    }

    set divMode(value) {
        this._currentMode = value;
        this._currentStatus = '';
        this.dispatchEvent(new CustomEvent('statechange', {
            bubbles: true,
            composed: true,
            detail: { mode: this._currentMode, status: this._currentStatus }
        }));
    }

    set divError(value) {
        if (this._currentMode !== 'loading' && this._currentMode !== '') return;
        this._currentMode = 'error';
        this._currentStatus = value;
        this.dispatchEvent(new CustomEvent('statechange', {
            bubbles: true,
            composed: true,
            detail: { mode: this._currentMode, status: this._currentStatus }
        }));
    }

    oninit() {
        console.debug('stream.oninit');
        super.oninit();
        this.appendChild(this.video);
    }

    onconnect() {
        console.debug('stream.onconnect');
        const result = super.onconnect();
        if (result) this.divMode = 'loading';
        return result;
    }

    ondisconnect() {
        console.debug('stream.ondisconnect');
        super.ondisconnect();
    }

    onopen() {
        console.debug('stream.onopen');
        const result = super.onopen();

        this.onmessage['stream'] = msg => {
            console.debug('stream.onmessage', msg);
            switch (msg.type) {
                case 'error':
                    this.divError = msg.value;
                    break;
                case 'mse':
                case 'hls':
                case 'mp4':
                case 'mjpeg':
                    this.divMode = msg.type.toUpperCase();
                    break;
            }
        };

        return result;
    }

    onclose() {
        console.debug('stream.onclose');
        return super.onclose();
    }

    onpcvideo(ev) {
        console.debug('stream.onpcvideo');
        super.onpcvideo(ev);

        if (this.pcState !== WebSocket.CLOSED) {
            this.divMode = 'RTC';
        }
    }
}

customElements.define('video-stream', VideoStream);

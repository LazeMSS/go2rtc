/**
 * CameraFrame - Reusable Web Component for framing go2rtc video streams and players.
 *
 * Features:
 * - Header bar with title, pulse status dot, mode badge, unmute button, links shortcut, and fullscreen toggle.
 * - Optional reorder controls (drag handle, move buttons) for multi-camera multiview layouts.
 * - Clean 16:9 aspect-ratio video surface with zero obscuring overlays.
 * - Automatic <video-stream> embedding or wrapping of custom child elements (e.g. <video>).
 * - Centralized fullscreen management with dynamic icon and tooltip updates.
 *
 * Attributes:
 * - src: Stream name/ID (e.g. "camera1")
 * - title: Display name shown in header
 * - mode: Requested streaming mode (e.g. "webrtc", "mse", "hls")
 * - sortable: If present, displays drag handle and move earlier/later buttons
 * - links: If "false", hides the links.html shortcut button
 * - has-unmute: If present, enables the unmute button in header actions
 * - background: Passed through to <video-stream>
 */
class CameraFrame extends HTMLElement {
    static get observedAttributes() {
        return ['src', 'title', 'mode', 'sortable', 'links', 'has-unmute', 'cam-number'];
    }

    constructor() {
        super();
        this._src = '';
        this._title = '';
        this._mode = '';
        this._sortable = false;
        this._showLinks = true;
        this._hasUnmute = false;
        this._rendered = false;

        this._onFullscreenChange = this._onFullscreenChange.bind(this);
    }

    get src() {
        return this.getAttribute('src') || this._src;
    }

    set src(val) {
        if (val) this.setAttribute('src', val);
        else this.removeAttribute('src');
    }

    get title() {
        return this.getAttribute('title') || this._title || this.src || 'Stream';
    }

    set title(val) {
        if (val) this.setAttribute('title', val);
        else this.removeAttribute('title');
    }

    get mode() {
        return this.getAttribute('mode') || this._mode;
    }

    set mode(val) {
        if (val) this.setAttribute('mode', val);
        else this.removeAttribute('mode');
    }

    get sortable() {
        return this.hasAttribute('sortable');
    }

    set sortable(val) {
        if (val) this.setAttribute('sortable', '');
        else this.removeAttribute('sortable');
    }

    get camNumber() {
        return this.getAttribute('cam-number') || '';
    }

    set camNumber(val) {
        if (val) this.setAttribute('cam-number', String(val));
        else this.removeAttribute('cam-number');
    }

    get video() {
        const stream = this.querySelector('video-stream');
        if (stream && stream.video) return stream.video;
        const v = this.querySelector('video');
        if (v) return v;
        return stream;
    }

    /**
     * Toggle mute state of the camera.
     * @returns {boolean} New unmuted state (true = audio playing, false = muted)
     */
    toggleMute() {
        const v = this.video;
        if (!v) return false;
        v.muted = !v.muted;
        if (!v.muted) {
            v.volume = 1.0;
            v.play?.().catch(() => {});
        }
        this._syncUnmuteState();
        return !v.muted;
    }

    /**
     * Set explicit mute state of the camera.
     * @param {boolean} muted
     */
    setMuted(muted = true) {
        const v = this.video;
        if (!v) return;
        v.muted = muted;
        if (!muted) {
            v.volume = 1.0;
            v.play?.().catch(() => {});
        }
        this._syncUnmuteState();
    }

    connectedCallback() {
        if (!this._rendered) {
            this._render();
        }
        document.addEventListener('fullscreenchange', this._onFullscreenChange);
    }

    disconnectedCallback() {
        document.removeEventListener('fullscreenchange', this._onFullscreenChange);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal) return;
        if (name === 'src') {
            this._src = newVal || '';
            this.dataset.src = this._src;
            this._updateTitleAndLinks();
        } else if (name === 'title') {
            this._title = newVal || '';
            this._updateTitleAndLinks();
        } else if (name === 'mode') {
            this._mode = newVal || '';
            this.dataset.mode = this._mode;
        } else if (name === 'sortable') {
            this._sortable = this.hasAttribute('sortable');
            this._updateReorderVisibility();
        } else if (name === 'links') {
            this._showLinks = newVal !== 'false';
            if (this._btnLinks) {
                this._btnLinks.classList.toggle('hidden', !this._showLinks);
            }
        } else if (name === 'has-unmute') {
            this._hasUnmute = this.hasAttribute('has-unmute');
            this._updateUnmuteButton();
        } else if (name === 'cam-number') {
            this._updateCamNumber();
        }
    }

    _render() {
        this._rendered = true;
        this.classList.add('stream-frame');
        this.dataset.src = this.src;
        this.dataset.mode = this.mode;

        // Preserve any existing child elements (e.g. native <video>)
        const existingChildren = Array.from(this.childNodes);

        this.innerHTML = `
            <div class="stream-frame-header">
                <div class="stream-frame-title" title="${this.title}">
                    <div class="stream-reorder-group ${this.sortable ? '' : 'hidden'}" title="Reorder camera (drag or use arrows)">
                        <button type="button" class="stream-reorder-btn btn-move-prev" title="Move earlier" aria-label="Move stream earlier">
                            <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                        </button>
                        <div class="stream-drag-handle" title="Drag to reorder" aria-label="Drag handle">
                            <svg viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                        </div>
                        <button type="button" class="stream-reorder-btn btn-move-next" title="Move later" aria-label="Move stream later">
                            <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                        </button>
                    </div>
                    <span class="cam-num-badge ${this.camNumber ? '' : 'hidden'}" title="${this.camNumber ? 'Press ' + this.camNumber + ' to maximize' : ''}">${this.camNumber}</span>
                    <span class="pulse-indicator"></span>
                    <span class="stream-title-text">${this.title}</span>
                </div>
                <div class="stream-frame-actions">
                    <span class="stream-mode-badge badge-state-info">CONNECTING</span>
                    <button type="button" class="stream-frame-btn btn-unmute ${this.hasAttribute('has-unmute') ? '' : 'hidden'}" title="Click to unmute audio" aria-label="Toggle audio">
                        <svg class="icon-muted" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                        <svg class="icon-unmuted hidden" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    </button>
                    <a href="#" class="stream-frame-btn btn-links ${this._showLinks && this.src ? '' : 'hidden'}" title="Stream Links & Embeds" target="_blank">
                        <svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                    </a>
                    <button type="button" class="stream-frame-btn btn-fs" title="Maximize Camera">
                        <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                    </button>
                </div>
            </div>
            <div class="stream-frame-body"></div>
        `;

        this._headerEl = this.querySelector('.stream-frame-header');
        this._titleEl = this.querySelector('.stream-title-text');
        this._titleWrap = this.querySelector('.stream-frame-title');
        this._camNumEl = this.querySelector('.cam-num-badge');
        this._reorderGroup = this.querySelector('.stream-reorder-group');
        this._btnPrev = this.querySelector('.btn-move-prev');
        this._btnNext = this.querySelector('.btn-move-next');
        this._badgeEl = this.querySelector('.stream-mode-badge');
        this._btnUnmute = this.querySelector('.btn-unmute');
        this._btnLinks = this.querySelector('.btn-links');
        this._btnFs = this.querySelector('.btn-fs');
        this._bodyEl = this.querySelector('.stream-frame-body');

        // Reorder button listeners
        this._btnPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent('reorder-prev', { bubbles: true }));
        });
        this._btnNext.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent('reorder-next', { bubbles: true }));
        });

        // Unmute button listener
        this._btnUnmute.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMute();
        });

        // Fullscreen toggle listener
        this._btnFs.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Re-insert or create video content
        const hasContent = existingChildren.some(el => el.nodeType === 1);
        if (hasContent) {
            existingChildren.forEach(child => this._bodyEl.appendChild(child));
        } else if (this.src) {
            this._createVideoStream();
        }

        const v = this.video;
        if (v) {
            v.addEventListener('volumechange', () => this._syncUnmuteState());
        }

        this._updateUnmuteButton();
        this._updateTitleAndLinks();
    }

    _createVideoStream() {
        const video = document.createElement('video-stream');
        video.background = this.getAttribute('background') !== 'false';
        if (this.mode) video.mode = this.mode;
        video.src = new URL('api/ws?src=' + encodeURIComponent(this.src), location.href);

        video.addEventListener('statechange', (e) => {
            const { mode, status } = e.detail;
            this._updateBadgeFromState(mode, status);
        });

        this._bodyEl.appendChild(video);
    }

    _updateBadgeFromState(mode, status) {
        if (!this._badgeEl) return;
        const text = (mode || '').toUpperCase();
        if (!text) return;

        if (text === 'ERROR') {
            this.setBadge(status ? `ERROR (${status})` : 'ERROR', 'error', status || 'Stream connection error');
        } else if (['RTC', 'MSE', 'HLS', 'MP4', 'MJPEG'].includes(text)) {
            this.setBadge(text, 'success', `Connected via ${text}`);
        } else if (text === 'LOADING') {
            this.setBadge('CONNECTING', 'info', 'Establishing connection...');
        } else {
            this.setBadge(text, 'info');
        }
    }

    _updateTitleAndLinks() {
        const safeTitle = this.title || this.src || 'Stream';
        if (this._titleEl) this._titleEl.textContent = safeTitle;
        if (this._titleWrap) this._titleWrap.title = safeTitle;

        if (this._btnLinks) {
            if (this.src && this._showLinks) {
                this._btnLinks.href = `links.html?src=${encodeURIComponent(this.src)}`;
                this._btnLinks.classList.remove('hidden');
            } else {
                this._btnLinks.classList.add('hidden');
            }
        }
    }

    _updateReorderVisibility() {
        if (this._reorderGroup) {
            this._reorderGroup.classList.toggle('hidden', !this.sortable);
        }
    }

    _updateCamNumber() {
        if (!this._camNumEl) {
            this._camNumEl = this.querySelector('.cam-num-badge');
        }
        if (this._camNumEl) {
            const num = this.camNumber;
            this._camNumEl.textContent = num;
            this._camNumEl.title = num ? `Press ${num} to maximize` : '';
            this._camNumEl.classList.toggle('hidden', !num);
        }
    }

    _updateUnmuteButton() {
        if (!this._btnUnmute) return;
        if (this.hasAttribute('has-unmute')) {
            this._btnUnmute.classList.remove('hidden');
            this._syncUnmuteState();
        }
    }

    _syncUnmuteState() {
        const v = this.video;
        if (!v || !this._btnUnmute) return;
        const isMuted = v.muted;
        const iconMuted = this._btnUnmute.querySelector('.icon-muted');
        const iconUnmuted = this._btnUnmute.querySelector('.icon-unmuted');

        if (iconMuted) iconMuted.classList.toggle('hidden', !isMuted);
        if (iconUnmuted) iconUnmuted.classList.toggle('hidden', isMuted);

        this._btnUnmute.title = isMuted ? 'Click to unmute audio (M)' : 'Mute audio (M)';
        this._btnUnmute.classList.toggle('active-audio', !isMuted);
    }

    /**
     * Update the badge text, visual state pill, and optional tooltip.
     * @param {string} text - Badge label
     * @param {'info'|'success'|'error'|'warning'} state - Color state
     * @param {string} [tooltip] - Hover tooltip
     */
    setBadge(text, state = 'info', tooltip = '') {
        if (!this._badgeEl) return;
        this._badgeEl.textContent = text;
        this._badgeEl.className = `stream-mode-badge badge-state-${state}`;
        if (tooltip) this._badgeEl.title = tooltip;
    }

    /**
     * Show or hide the unmute button in the header actions bar.
     * @param {boolean} show
     */
    showUnmute(show = true) {
        if (this._btnUnmute) {
            this._btnUnmute.classList.toggle('hidden', !show);
            this._syncUnmuteState();
        }
    }

    /**
     * Toggle fullscreen on this camera frame element.
     */
    toggleFullscreen() {
        if (document.fullscreenElement === this) {
            document.exitFullscreen().catch(() => {});
        } else {
            this.requestFullscreen().catch(() => {});
        }
    }

    /**
     * Disable or enable earlier/later reorder buttons.
     */
    setMoveButtonsDisabled({ prevDisabled = false, nextDisabled = false } = {}) {
        if (this._btnPrev) this._btnPrev.disabled = prevDisabled;
        if (this._btnNext) this._btnNext.disabled = nextDisabled;
    }

    _onFullscreenChange() {
        if (!this._btnFs) return;
        const isThisFs = (document.fullscreenElement === this);

        this._btnFs.title = isThisFs ? 'Exit Fullscreen' : 'Maximize Camera';
        this._btnFs.innerHTML = isThisFs
            ? `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`
            : `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
    }
}

customElements.define('camera-frame', CameraFrame);
if (typeof window !== 'undefined') window.CameraFrame = CameraFrame;

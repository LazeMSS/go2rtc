// Immediate Theme Application & Manager
(function() {
    const THEME_KEY = 'go2rtc-theme';
    let currentPreference = localStorage.getItem(THEME_KEY) || 'system';

    function getResolvedTheme(pref) {
        if (pref === 'system') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return pref;
    }

    function applyTheme(pref) {
        currentPreference = pref;
        const resolved = getResolvedTheme(pref);
        document.documentElement.setAttribute('data-theme', resolved);
        document.documentElement.setAttribute('data-theme-preference', pref);

        document.querySelectorAll('.theme-segment-btn').forEach(btn => {
            const mode = btn.getAttribute('data-theme-mode');
            btn.classList.toggle('active', mode === pref);
        });

        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { preference: pref, resolved, isDark: resolved === 'dark' }
        }));
    }

    window.setGo2rtcTheme = function(mode) {
        localStorage.setItem(THEME_KEY, mode);
        applyTheme(mode);
    };

    window.getGo2rtcTheme = function() {
        return currentPreference;
    };

    window.isDarkMode = function() {
        return document.documentElement.getAttribute('data-theme') !== 'light';
    };

    // Apply theme immediately to prevent flashing
    applyTheme(currentPreference);

    // Dynamic listener for system color scheme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (currentPreference === 'system') {
                applyTheme('system');
            }
        });
    }

    // Ensure modern stylesheet is linked
    if (!document.querySelector('link[href*="style.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'style.css';
        document.head.appendChild(link);
    }

    // Ensure favicon is linked
    if (!document.querySelector('link[rel*="icon"]')) {
        const icon = document.createElement('link');
        icon.rel = 'icon';
        icon.href = 'favicon.ico';
        document.head.appendChild(icon);
    }

    // Inject modern header navigation if not already present
    function initHeader() {
        if (!document.body || document.querySelector('header.modern-header')) return;

        const rawPage = location.pathname.split('/').pop();
        const currentPage = rawPage === '' ? 'index.html' : rawPage;

        // Dedicated stream and WebRTC player pages should not have the global modern-header
        if (currentPage.startsWith('webrtc') || currentPage === 'stream.html' || currentPage === 'hls.html' || document.body.classList.contains('stream-body-page')) {
            return;
        }

        const navItems = [
            { href: 'index.html', label: 'Streams' },
            { href: 'config.html', label: 'Config' },
            { href: 'log.html', label: 'Log' },
            { href: 'net.html', label: 'Net' },
        ];

        const navLinks = navItems.map(item => {
            const isActive = (currentPage === item.href || (item.href === 'index.html' && currentPage === 'index.html')) ? 'active' : '';
            return `<li class="nav-item"><a href="${item.href}" class="${isActive}">${item.label}</a></li>`;
        }).join('');

        const headerHTML = `
<header class="modern-header">
    <nav class="modern-nav">
        <a href="index.html" class="brand-wrapper">
            <div class="brand-logo">
                <img src="favicon.ico" alt="go2rtc" class="brand-icon">
            </div>
            <span class="brand-name">go2rtc</span>
        </a>
        <button type="button" class="nav-toggle-btn" id="nav-toggle-btn" aria-label="Toggle navigation menu" aria-expanded="false">
            <svg class="icon-menu" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
            <svg class="icon-close hidden" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <div class="nav-right-cluster" id="nav-right-cluster">
            <ul class="nav-links">
                ${navLinks}
            </ul>
            <div class="mobile-theme-row">
                <span class="mobile-theme-label">Theme</span>
                <div class="theme-segmented" role="radiogroup" aria-label="Theme selection">
                    <button type="button" class="theme-segment-btn ${currentPreference === 'light' ? 'active' : ''}" data-theme-mode="light" title="Light theme">
                        <svg viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-13c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1V3c0-.55-.45-1-1-1zm0 16c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1zm9-9h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zm-16 0H3c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zm14.36-6.36c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.41-1.41zm-12.72 12.72c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.41-1.41zm14.14 0l-1.41-1.41c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41zm-12.72-12.72l-1.41-1.41c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41z"/></svg>
                    </button>
                    <button type="button" class="theme-segment-btn ${currentPreference === 'dark' ? 'active' : ''}" data-theme-mode="dark" title="Dark theme">
                        <svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>
                    </button>
                    <button type="button" class="theme-segment-btn ${currentPreference === 'system' ? 'active' : ''}" data-theme-mode="system" title="Sync with system (Auto)">
                        <svg viewBox="0 0 24 24"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </nav>
</header>
`;

        document.body.insertAdjacentHTML('afterbegin', headerHTML);

        // Bind theme switcher clicks
        document.querySelectorAll('.theme-segment-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-theme-mode');
                window.setGo2rtcTheme(mode);
            });
        });

        // Mobile navigation drawer toggle
        const toggleBtn = document.getElementById('nav-toggle-btn');
        const cluster = document.getElementById('nav-right-cluster');
        if (toggleBtn && cluster) {
            const iconMenu = toggleBtn.querySelector('.icon-menu');
            const iconClose = toggleBtn.querySelector('.icon-close');

            const setMenuOpen = (open) => {
                cluster.classList.toggle('mobile-open', open);
                toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (iconMenu) iconMenu.classList.toggle('hidden', open);
                if (iconClose) iconClose.classList.toggle('hidden', !open);
            };

            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = cluster.classList.contains('mobile-open');
                setMenuOpen(!isOpen);
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (cluster.classList.contains('mobile-open') && !cluster.contains(e.target) && !toggleBtn.contains(e.target)) {
                    setMenuOpen(false);
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && cluster.classList.contains('mobile-open')) {
                    setMenuOpen(false);
                }
            });

            // Close when a navigation link is clicked
            cluster.querySelectorAll('.nav-item a').forEach(link => {
                link.addEventListener('click', () => setMenuOpen(false));
            });
        }
    }

    // =========================================================
    // Modern Toast Notification System
    // =========================================================
    function getToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function escapeToastHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    const toastIcons = {
        success: '<svg class="toast-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
        error: '<svg class="toast-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
        warning: '<svg class="toast-icon" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
        info: '<svg class="toast-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
    };

    window.showToast = function(message, type = 'info', duration = 4000, allowHTML = false) {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => window.showToast(message, type, duration, allowHTML));
            return;
        }
        const container = getToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        
        const iconHTML = toastIcons[type] || toastIcons.info;
        const contentHTML = allowHTML ? message : escapeToastHTML(message);
        toast.innerHTML = `
            ${iconHTML}
            <div class="toast-content">${contentHTML}</div>
            <button type="button" class="toast-close-btn" aria-label="Dismiss notification">
                <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
        `;

        const removeToast = () => {
            if (toast.classList.contains('toast-out')) return;
            toast.classList.add('toast-out');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 250);
        };

        toast.querySelector('.toast-close-btn').addEventListener('click', removeToast);

        let timeoutId = setTimeout(removeToast, duration);
        toast.addEventListener('mouseenter', () => clearTimeout(timeoutId));
        toast.addEventListener('mouseleave', () => { timeoutId = setTimeout(removeToast, 2000); });

        container.appendChild(toast);
    };

    // =========================================================
    // Modern Modal Dialog System (Promise-Based)
    // =========================================================
    window.showModal = function({
        title = 'Confirm Action',
        message = '',
        icon = 'info',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        isDanger = false,
        input = null,
    }) {
        return new Promise((resolve) => {
            const modalBackdrop = document.createElement('div');
            modalBackdrop.className = 'modal-backdrop';

            const iconSvg = isDanger || icon === 'danger'
                ? '<svg class="modal-icon icon-danger" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
                : (icon === 'warning'
                    ? '<svg class="modal-icon icon-warning" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'
                    : '<svg class="modal-icon icon-info" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>');

            const inputHTML = input
                ? `<input type="text" class="modal-input" placeholder="${escapeToastHTML(input.placeholder || '')}" autocomplete="off" spellcheck="false" />`
                : '';

            modalBackdrop.innerHTML = `
                <div class="modal-dialog" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div class="modal-title-wrap">
                            ${iconSvg}
                            <span>${escapeToastHTML(title)}</span>
                        </div>
                        <button type="button" class="toast-close-btn btn-modal-close" aria-label="Close dialog">
                            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div>${message}</div>
                        ${inputHTML}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary btn-sm btn-modal-cancel">${escapeToastHTML(cancelText)}</button>
                        <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'} btn-sm btn-modal-confirm" ${input && input.expectedValue ? 'disabled' : ''}>${escapeToastHTML(confirmText)}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modalBackdrop);

            const inputEl = modalBackdrop.querySelector('.modal-input');
            const confirmBtn = modalBackdrop.querySelector('.btn-modal-confirm');
            const cancelBtn = modalBackdrop.querySelector('.btn-modal-cancel');
            const closeBtn = modalBackdrop.querySelector('.btn-modal-close');

            const cleanup = (value) => {
                modalBackdrop.classList.add('modal-out');
                setTimeout(() => {
                    if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
                }, 150);
                resolve(value);
            };

            if (input && input.expectedValue) {
                inputEl.addEventListener('input', () => {
                    confirmBtn.disabled = (inputEl.value.trim() !== input.expectedValue);
                });
            }

            confirmBtn.addEventListener('click', () => {
                const result = input ? inputEl.value.trim() : true;
                cleanup(result);
            });

            cancelBtn.addEventListener('click', () => cleanup(false));
            closeBtn.addEventListener('click', () => cleanup(false));

            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) cleanup(false);
            });

            const onKeydown = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', onKeydown);
                    cleanup(false);
                } else if (e.key === 'Enter' && !confirmBtn.disabled) {
                    document.removeEventListener('keydown', onKeydown);
                    const result = input ? inputEl.value.trim() : true;
                    cleanup(result);
                }
            };
            document.addEventListener('keydown', onKeydown);

            if (inputEl) {
                setTimeout(() => inputEl.focus(), 50);
            } else {
                setTimeout(() => confirmBtn.focus(), 50);
            }
        });
    };

    // =========================================================
    // Browser Hardware Acceleration Detection
    // =========================================================
    function checkHardwareAcceleration() {
        const rawPage = location.pathname.split('/').pop();
        const currentPage = rawPage === '' ? 'index.html' : rawPage;

        // Run check on video streaming & player pages (stream.html, webrtc*, hls.html, index.html)
        const isVideoPage = (
            currentPage === 'stream.html' ||
            currentPage.startsWith('webrtc') ||
            currentPage === 'hls.html' ||
            currentPage === 'index.html' ||
            document.body.classList.contains('stream-body-page')
        );
        if (!isVideoPage) return;

        // Check if user already dismissed or was warned in this session
        try {
            if (sessionStorage.getItem('go2rtc_hw_warned') || localStorage.getItem('go2rtc_hw_dismissed')) {
                return;
            }
        } catch (e) {}

        let isSoftware = false;
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                // WebGL failed completely, hardware acceleration is disabled or unsupported
                isSoftware = true;
            } else {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
                    const softwareRenderers = [
                        'swiftshader',
                        'llvmpipe',
                        'softpipe',
                        'software rasterizer',
                        'microsoft basic render driver',
                        'apple software renderer'
                    ];
                    isSoftware = softwareRenderers.some(sw => renderer.includes(sw));
                }
            }
        } catch (e) {
            isSoftware = false;
        }

        if (isSoftware) {
            try {
                sessionStorage.setItem('go2rtc_hw_warned', '1');
            } catch (e) {}

            setTimeout(() => {
                window.showToast(
                    `Hardware acceleration appears to be disabled in your browser. Video playback and multiview performance may be degraded. <a href="https://www.google.com/search?q=how+to+enable+browser+hardware+acceleration" target="_blank" rel="noopener noreferrer">How to enable it ↗</a>`,
                    'warning',
                    12000,
                    true
                );
            }, 800);
        }
    }

    window.checkHardwareAcceleration = checkHardwareAcceleration;

    const initApp = () => {
        initHeader();
        checkHardwareAcceleration();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();

const params = new URLSearchParams(location.search);

// Support multiple streams and multiple modes
const streams = params.getAll('src');
const modes = params.getAll('mode');
if (modes.length === 0) modes.push('');

while (modes.length > streams.length) {
    streams.push(streams[0]);
}
while (streams.length > modes.length) {
    modes.push(modes[0]);
}

// Header visibility option (e.g. for iframes)
if (params.get('header') === 'false' || params.get('nav') === 'false' || params.get('nav') === '0') {
    document.getElementById('stream-nav').classList.add('hidden');
}

// Set page and header titles
const navTitle = document.getElementById('nav-title');
const navCount = document.getElementById('nav-count');
if (streams.length === 1 && streams[0]) {
    navTitle.innerText = streams[0];
    navCount.innerText = '1 Camera';
    document.title = `${streams[0]} - go2rtc`;
} else if (streams.length > 1) {
    navTitle.innerText = 'Multiview Monitor';
    navCount.innerText = `${streams.length} Cameras • Drag to sort`;
    navCount.title = 'Sortable: Drag cameras or use arrow controls. The URL updates automatically so you can bookmark your layout.';
    document.title = `${streams.join(' / ')} - go2rtc`;
}

// Global fullscreen toggle
document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
});

// Reconnect all streams
document.getElementById('btn-reconnect').addEventListener('click', () => {
    location.reload();
});

const container = document.getElementById('stream-container');
if (streams.length > 1) {
    container.classList.add('multi-stream');
} else {
    container.classList.add('single-stream');
}

const background = params.get('background') !== 'false';
const customWidth = params.get('width');

// Switch any target camera frame to fullscreen
const switchToFrameFullscreen = async (targetFrame) => {
    if (!targetFrame) return;
    try {
        await targetFrame.requestFullscreen();
    } catch (e) {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            await targetFrame.requestFullscreen();
        } catch (err) {
            console.warn('Fullscreen switch error:', err);
        }
    }
};

// Shift active stream left/right while in single-camera fullscreen
const shiftFullscreenStream = (direction) => {
    const fsFrame = document.fullscreenElement?.closest('camera-frame, .stream-frame');
    if (!fsFrame) return;
    const frames = Array.from(container.querySelectorAll('camera-frame'));
    if (frames.length <= 1) return;

    const currentIndex = frames.indexOf(fsFrame);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'prev'
        ? (currentIndex - 1 + frames.length) % frames.length
        : (currentIndex + 1) % frames.length;

    const targetFrame = frames[targetIndex];
    if (targetFrame && targetFrame !== fsFrame) {
        switchToFrameFullscreen(targetFrame);
    }
};

// Create a framed player for each stream using <camera-frame> Web Component
streams.forEach((streamName, i) => {
    const frame = document.createElement('camera-frame');
    frame.src = streamName;
    frame.title = streamName || `Stream ${i + 1}`;
    frame.mode = modes[i] || '';
    if (streams.length > 1) {
        frame.sortable = true;
        if (i < 9) frame.camNumber = (i + 1);
    }
    if (background) {
        frame.setAttribute('background', 'true');
    }
    if (customWidth) {
        frame.style.flex = `1 0 ${customWidth}`;
    }
    container.appendChild(frame);
});

// Multi-camera sorting & URL bookmarking support
if (streams.length > 1) {
    const updateMoveButtonStates = () => {
        const frames = Array.from(container.querySelectorAll('camera-frame'));
        frames.forEach((f, idx) => {
            f.camNumber = (frames.length > 1 && idx < 9) ? (idx + 1) : '';
            f.setMoveButtonsDisabled({
                prevDisabled: (idx === 0),
                nextDisabled: (idx === frames.length - 1)
            });
        });
    };

    const updateURLOrder = () => {
        const frames = Array.from(container.querySelectorAll('camera-frame'));
        const newStreams = frames.map(f => f.src);
        const newModes = frames.map(f => f.mode);

        const currentParams = new URLSearchParams(location.search);
        currentParams.delete('src');
        newStreams.forEach(s => currentParams.append('src', s));

        const initialModeCount = params.getAll('mode').length;
        if (initialModeCount > 1) {
            currentParams.delete('mode');
            newModes.forEach(m => currentParams.append('mode', m));
        }

        const newUrl = `${location.pathname}?${currentParams.toString()}`;
        window.history.replaceState(null, '', newUrl);

        document.title = `${newStreams.join(' / ')} - go2rtc`;
        updateMoveButtonStates();
    };

    // Reorder event delegation from <camera-frame>
    container.addEventListener('reorder-prev', (e) => {
        if (document.fullscreenElement && document.fullscreenElement.closest('camera-frame, .stream-frame')) {
            shiftFullscreenStream('prev');
            return;
        }
        const frame = e.target.closest('camera-frame');
        if (!frame) return;
        const prev = frame.previousElementSibling;
        if (prev) {
            container.insertBefore(frame, prev);
            updateURLOrder();
        }
    });

    container.addEventListener('reorder-next', (e) => {
        if (document.fullscreenElement && document.fullscreenElement.closest('camera-frame, .stream-frame')) {
            shiftFullscreenStream('next');
            return;
        }
        const frame = e.target.closest('camera-frame');
        if (!frame) return;
        const next = frame.nextElementSibling;
        if (next) {
            container.insertBefore(next, frame);
            updateURLOrder();
        }
    });

    // Drag-and-drop reordering
    let draggedFrame = null;

    container.querySelectorAll('camera-frame').forEach(frame => {
        frame.setAttribute('draggable', 'true');

        frame.addEventListener('dragstart', (e) => {
            if (document.fullscreenElement || e.target.closest('.stream-frame-btn') || e.target.closest('a') || e.target.closest('.stream-reorder-btn')) {
                e.preventDefault();
                return;
            }
            draggedFrame = frame;
            frame.classList.add('is-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', frame.src);
        });

        frame.addEventListener('dragend', () => {
            frame.classList.remove('is-dragging');
            container.querySelectorAll('camera-frame').forEach(f => {
                f.classList.remove('drag-over', 'drag-over-before', 'drag-over-after');
            });
            draggedFrame = null;
        });

        frame.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedFrame || draggedFrame === frame) return;
            e.dataTransfer.dropEffect = 'move';

            const rect = frame.getBoundingClientRect();
            const isAfter = (e.clientX - rect.left) > (rect.width / 2);
            frame.classList.add('drag-over');
            frame.classList.toggle('drag-over-after', isAfter);
            frame.classList.toggle('drag-over-before', !isAfter);
        });

        frame.addEventListener('dragleave', (e) => {
            if (!frame.contains(e.relatedTarget)) {
                frame.classList.remove('drag-over', 'drag-over-before', 'drag-over-after');
            }
        });

        frame.addEventListener('drop', (e) => {
            e.preventDefault();
            frame.classList.remove('drag-over', 'drag-over-before', 'drag-over-after');
            if (!draggedFrame || draggedFrame === frame) return;

            const rect = frame.getBoundingClientRect();
            const isAfter = (e.clientX - rect.left) > (rect.width / 2);
            if (isAfter) {
                container.insertBefore(draggedFrame, frame.nextSibling);
            } else {
                container.insertBefore(draggedFrame, frame);
            }
            updateURLOrder();
        });
    });

    // Fullscreen state listener to adapt button tooltips when shifting
    document.addEventListener('fullscreenchange', () => {
        const fsFrame = document.fullscreenElement?.closest('camera-frame, .stream-frame');
        const isSingleFs = !!fsFrame;

        container.querySelectorAll('camera-frame').forEach(f => {
            const prev = f.querySelector('.btn-move-prev');
            const next = f.querySelector('.btn-move-next');

            if (prev && next) {
                if (isSingleFs) {
                    prev.title = 'Previous camera (shift stream)';
                    next.title = 'Next camera (shift stream)';
                    prev.disabled = false;
                    next.disabled = false;
                } else {
                    prev.title = 'Move earlier';
                    next.title = 'Move later';
                }
            }
        });

        if (!isSingleFs) {
            updateMoveButtonStates();
        }
    });

    updateMoveButtonStates();
}

// Keyboard Shortcuts Modal Dialog
const showShortcutsModal = () => {
    // Prevent duplicate dialogs
    if (document.querySelector('.shortcuts-modal-backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop shortcuts-modal-backdrop';

    backdrop.innerHTML = `
        <div class="modal-dialog" role="dialog" aria-modal="true">
            <div class="modal-header">
                <div class="modal-title-wrap">
                    <svg class="modal-icon icon-info" viewBox="0 0 24 24"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>
                    <span>Keyboard Shortcuts</span>
                </div>
                <button type="button" class="toast-close-btn btn-modal-close" aria-label="Close dialog">✕</button>
            </div>
            <div class="modal-body shortcuts-modal-list">
                <div class="shortcut-row">
                    <div class="shortcut-keys"><kbd class="shortcut-kbd">1</kbd>–<kbd class="shortcut-kbd">9</kbd></div>
                    <div class="shortcut-desc">Maximize camera 1–9 (press again to return to grid)</div>
                </div>
                <div class="shortcut-row">
                    <div class="shortcut-keys"><kbd class="shortcut-kbd">F</kbd></div>
                    <div class="shortcut-desc">Toggle fullscreen (entire grid or camera)</div>
                </div>
                <div class="shortcut-row">
                    <div class="shortcut-keys"><kbd class="shortcut-kbd">M</kbd></div>
                    <div class="shortcut-desc">Mute / Unmute audio (mutes all or unmutes active)</div>
                </div>
                <div class="shortcut-row">
                    <div class="shortcut-keys"><kbd class="shortcut-kbd">←</kbd> <kbd class="shortcut-kbd">→</kbd></div>
                    <div class="shortcut-desc">Cycle cameras while in fullscreen</div>
                </div>
                <div class="shortcut-row">
                    <div class="shortcut-keys"><kbd class="shortcut-kbd">R</kbd></div>
                    <div class="shortcut-desc">Reconnect all active streams</div>
                </div>
                <div class="shortcut-row">
                    <div class="shortcut-keys"><kbd class="shortcut-kbd">?</kbd></div>
                    <div class="shortcut-desc">Show this keyboard shortcuts guide</div>
                </div>
                <div class="shortcut-row">
                    <div class="shortcut-keys"><kbd class="shortcut-kbd">Esc</kbd></div>
                    <div class="shortcut-desc">Close dialog / exit camera fullscreen</div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-sm btn-modal-close">Got It</button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);

    const closeDialog = () => {
        backdrop.classList.add('modal-out');
        setTimeout(() => {
            if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        }, 150);
        document.removeEventListener('keydown', onEsc);
    };

    const onEsc = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            closeDialog();
        }
    };

    backdrop.querySelectorAll('.btn-modal-close').forEach(b => b.addEventListener('click', closeDialog));
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeDialog();
    });
    document.addEventListener('keydown', onEsc);
};

const btnShortcuts = document.getElementById('btn-shortcuts');
if (btnShortcuts) {
    btnShortcuts.addEventListener('click', () => {
        showShortcutsModal();
    });
}

// Comprehensive Keyboard Navigation & Shortcuts
document.addEventListener('keydown', (e) => {
    // Ignore keystrokes in input elements or with modifier keys
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    const key = e.key;
    const frames = Array.from(container.querySelectorAll('camera-frame'));
    const fsElement = document.fullscreenElement;
    const fsFrame = fsElement?.closest('camera-frame, .stream-frame');

    // 1-9: Focus or Maximize Camera 1 through 9
    if (key >= '1' && key <= '9') {
        const idx = parseInt(key, 10) - 1;
        if (idx < frames.length) {
            e.preventDefault();
            const target = frames[idx];
            if (fsFrame === target) {
                // If this camera is already maximized in fullscreen, return to multiview
                document.exitFullscreen().catch(() => {});
            } else {
                switchToFrameFullscreen(target);
                window.showToast?.(`Camera ${idx + 1}: ${target.title || target.src}`, 'info', 1500);
            }
        }
        return;
    }

    // F: Global Fullscreen toggle
    if (key === 'f' || key === 'F') {
        e.preventDefault();
        if (fsElement) {
            document.exitFullscreen().catch(() => {});
        } else {
            document.documentElement.requestFullscreen().catch(() => {});
        }
        return;
    }

    // M: Toggle Mute / Unmute
    if (key === 'm' || key === 'M') {
        e.preventDefault();
        if (fsFrame && typeof fsFrame.toggleMute === 'function') {
            // When a single camera is fullscreen, toggle its audio
            const unmuted = fsFrame.toggleMute();
            window.showToast?.(`${fsFrame.title || 'Camera'}: ${unmuted ? 'Unmuted 🔊' : 'Muted 🔇'}`, 'info', 1500);
        } else if (frames.length > 0) {
            // In multiview grid:
            // Check if any camera is currently unmuted
            const anyUnmuted = frames.some(f => f.video && f.video.muted === false);
            if (anyUnmuted) {
                // Mute all cameras
                frames.forEach(f => f.setMuted?.(true));
                window.showToast?.('All Cameras Muted 🔇', 'info', 1500);
            } else {
                // Unmute the hovered camera or the first camera
                const hovered = frames.find(f => f.matches(':hover')) || frames[0];
                const unmuted = hovered.toggleMute?.();
                window.showToast?.(`${hovered.title || 'Camera 1'}: ${unmuted ? 'Unmuted 🔊' : 'Muted 🔇'}`, 'info', 1500);
            }
        }
        return;
    }

    // ArrowLeft / ArrowRight: Cycle active camera in fullscreen
    if (fsFrame && frames.length > 1) {
        if (key === 'ArrowLeft') {
            e.preventDefault();
            shiftFullscreenStream('prev');
            return;
        }
        if (key === 'ArrowRight') {
            e.preventDefault();
            shiftFullscreenStream('next');
            return;
        }
    }

    // R: Quick Reconnect
    if (key === 'r' || key === 'R') {
        e.preventDefault();
        location.reload();
        return;
    }

    // ?: Show Keyboard Shortcuts Help
    if (key === '?') {
        e.preventDefault();
        showShortcutsModal();
    }
});

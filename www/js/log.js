const cleanBtn = document.getElementById('clean');
const reverseBtn = document.getElementById('reverse');
const reverseText = document.getElementById('reverse-text');
const updateBtn = document.getElementById('update');
const updateText = document.getElementById('update-text');
const autoscrollBtn = document.getElementById('autoscroll');
const autoscrollText = document.getElementById('autoscroll-text');
const autoBadge = document.getElementById('auto-badge');
const logCount = document.getElementById('log-count');
const logFilteredCount = document.getElementById('log-filtered-count');
const logWrapper = document.getElementById('log-wrapper');
const logTbody = document.getElementById('log');
const logSearch = document.getElementById('log-search');
const logSearchClear = document.getElementById('log-search-clear');
const levelPills = document.querySelectorAll('.level-pill');

const MAX_LOG_ENTRIES = 2500;
const KEYS = ['time', 'level', 'message'];

let logEntries = [];
let reverseOrder = false;
let isStreaming = true;
let autoScrollEnabled = true;
let isAtBottom = true;
let activeLevel = 'all';
let searchQuery = '';
let eventSource = null;
let fallbackInterval = null;

// Responsive layout calculation
const layout = () => {
    if (logWrapper) {
        const top = logWrapper.getBoundingClientRect().top;
        const h = Math.max(200, window.innerHeight - top - 16);
        logWrapper.style.height = `${h}px`;
    }
};
window.addEventListener('resize', layout);

const logFilterDetails = document.getElementById('log-filter-details');
if (logFilterDetails) {
    logFilterDetails.addEventListener('toggle', () => {
        layout();
    });
    // Start collapsed on mobile to maximize visible log area
    if (window.innerWidth <= 768) {
        logFilterDetails.removeAttribute('open');
    }
}
layout();

// Sanitizes input text to prevent XSS
function escapeHTML(text) {
    if (typeof text !== 'string') text = String(text ?? '');
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Check if entry satisfies current level and search filters
function matchesFilter(entry) {
    if (!entry) return false;
    const lvl = (entry['level'] || 'info').toLowerCase();

    if (activeLevel !== 'all' && lvl !== activeLevel) {
        return false;
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const msg = (entry['message'] || '').toLowerCase();
        if (msg.includes(q)) return true;
        for (const k of Object.keys(entry)) {
            if (KEYS.indexOf(k) < 0) {
                const val = String(entry[k] || '').toLowerCase();
                if (k.toLowerCase().includes(q) || val.includes(q)) return true;
            }
        }
        return false;
    }

    return true;
}

// Build a <tr> DOM element for a log entry
function createRowElement(entry) {
    const tr = document.createElement('tr');
    tr._entry = entry;

    const lvl = (entry['level'] || 'info').toLowerCase();
    if (lvl === 'error') tr.className = 'log-row-error';
    else if (lvl === 'warn') tr.className = 'log-row-warn';

    const dateObj = new Date(entry['time']);
    const ts = isNaN(dateObj) ? escapeHTML(entry['time']) : dateObj.toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });

    const msg = Object.keys(entry).reduce((msgAcc, key) => {
        return KEYS.indexOf(key) < 0
            ? `${msgAcc} <span class="log-param-key">${escapeHTML(key)}=</span><span class="log-param-val">${escapeHTML(entry[key])}</span>`
            : msgAcc;
    }, escapeHTML(entry['message'] || ''));

    tr.innerHTML = `
        <td class="log-time">${ts}</td>
        <td class="text-center">
            <span class="log-level-badge log-level-${lvl}">${lvl}</span>
        </td>
        <td class="log-msg">${msg}</td>
    `;

    if (!matchesFilter(entry)) {
        tr.classList.add('hidden');
    }

    return tr;
}

// Update total and filtered count badges
function updateCountBadges() {
    logCount.innerText = `${logEntries.length} Lines`;

    if (activeLevel !== 'all' || searchQuery) {
        let visibleCount = 0;
        for (const tr of logTbody.children) {
            if (!tr.classList.contains('hidden') && tr._entry) visibleCount++;
        }
        logFilteredCount.innerText = `${visibleCount} Shown`;
        logFilteredCount.classList.remove('hidden');
    } else {
        logFilteredCount.classList.add('hidden');
    }
}

// Full re-render of current log entries
function renderAll() {
    logTbody.innerHTML = '';
    if (logEntries.length === 0) {
        logCount.innerText = '0 Lines';
        logFilteredCount.classList.add('hidden');
        logTbody.innerHTML = '<tr><td colspan="3" class="table-empty-cell">No logs recorded</td></tr>';
        return;
    }

    const fragment = document.createDocumentFragment();
    const ordered = reverseOrder ? [...logEntries].reverse() : logEntries;

    ordered.forEach(entry => {
        fragment.appendChild(createRowElement(entry));
    });

    logTbody.appendChild(fragment);
    updateCountBadges();

    if (autoScrollEnabled && !reverseOrder) {
        logWrapper.scrollTop = logWrapper.scrollHeight;
    }
}

// Incremental append for live streaming
function appendEntry(entry) {
    if (!entry) return;

    // Clear empty placeholder if present
    if (logEntries.length === 0) {
        logTbody.innerHTML = '';
    }

    logEntries.push(entry);

    // Maintain buffer limit
    if (logEntries.length > MAX_LOG_ENTRIES) {
        logEntries.shift();
        if (reverseOrder) {
            if (logTbody.lastElementChild) logTbody.lastElementChild.remove();
        } else {
            if (logTbody.firstElementChild) logTbody.firstElementChild.remove();
        }
    }

    const tr = createRowElement(entry);
    if (reverseOrder) {
        logTbody.insertBefore(tr, logTbody.firstElementChild);
    } else {
        logTbody.appendChild(tr);
    }

    updateCountBadges();

    // Auto-scroll to bottom if sticky and order is normal
    if (autoScrollEnabled && !reverseOrder && isAtBottom) {
        logWrapper.scrollTop = logWrapper.scrollHeight;
    }
}

// Reset log view
function clearTable() {
    logEntries = [];
    renderAll();
}

// Clear log buffer on backend
cleanBtn.addEventListener('click', async () => {
    const originalHTML = cleanBtn.innerHTML;
    try {
        const r = await fetch('api/log', { method: 'DELETE' });
        if (r.ok) {
            clearTable();
            cleanBtn.innerHTML = `
                <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                <span>Cleared!</span>
            `;
            setTimeout(() => { cleanBtn.innerHTML = originalHTML; }, 2000);
            window.showToast?.('Logs cleared successfully', 'info');
        } else {
            window.showToast?.('Failed to clear logs: ' + await r.text(), 'error');
        }
    } catch (e) {
        window.showToast?.(`Failed to clear logs: ${e.message}`, 'error');
    }
});

// Update UI button controls
function updateControlsUI() {
    const pauseIcon = updateBtn.querySelector('.icon-pause');
    const playIcon = updateBtn.querySelector('.icon-play');

    if (isStreaming) {
        updateBtn.className = 'btn btn-primary btn-sm';
        updateText.innerText = 'Stream: Live';
        if (pauseIcon) pauseIcon.classList.remove('hidden');
        if (playIcon) playIcon.classList.add('hidden');
        autoBadge.className = 'badge badge-online';
        autoBadge.innerHTML = '<span class="pulse-indicator"></span>Live Stream';
    } else {
        updateBtn.className = 'btn btn-secondary btn-sm';
        updateText.innerText = 'Stream: Paused';
        if (pauseIcon) pauseIcon.classList.add('hidden');
        if (playIcon) playIcon.classList.remove('hidden');
        autoBadge.className = 'badge badge-warning';
        autoBadge.innerHTML = '⏸ Paused';
    }

    if (autoScrollEnabled) {
        autoscrollBtn.className = 'btn btn-primary btn-sm';
        autoscrollText.innerText = 'Auto-Scroll: ON';
    } else {
        autoscrollBtn.className = 'btn btn-secondary btn-sm';
        autoscrollText.innerText = 'Auto-Scroll: OFF';
    }

    if (reverseOrder) {
        reverseText.innerText = 'Order: Newest First';
    } else {
        reverseText.innerText = 'Order: Newest Last';
    }
}

// Stream pause/resume toggle
updateBtn.addEventListener('click', () => {
    isStreaming = !isStreaming;
    updateControlsUI();
    if (isStreaming) {
        connectStream();
    } else {
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
        if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
        }
    }
});

// Auto-scroll toggle
autoscrollBtn.addEventListener('click', () => {
    autoScrollEnabled = !autoScrollEnabled;
    updateControlsUI();
    if (autoScrollEnabled && !reverseOrder) {
        isAtBottom = true;
        logWrapper.scrollTop = logWrapper.scrollHeight;
    }
});

// Chronological order toggle
reverseBtn.addEventListener('click', () => {
    reverseOrder = !reverseOrder;
    updateControlsUI();
    renderAll();
});

// Track manual user scrolling for sticky auto-scroll
logWrapper.addEventListener('scroll', () => {
    const threshold = 40;
    isAtBottom = (logWrapper.scrollHeight - logWrapper.scrollTop - logWrapper.clientHeight) <= threshold;
});

// Level Filter Pills
levelPills.forEach(pill => {
    pill.addEventListener('click', () => {
        levelPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeLevel = pill.dataset.level;
        filterTable();
    });
});

// Real-time Search Input
logSearch.addEventListener('input', () => {
    searchQuery = logSearch.value.trim();
    logSearchClear.classList.toggle('hidden', !searchQuery);
    filterTable();
});

logSearchClear.addEventListener('click', () => {
    logSearch.value = '';
    searchQuery = '';
    logSearchClear.classList.add('hidden');
    filterTable();
    logSearch.focus();
});

function updateLogFiltersBadge() {
    const badge = document.getElementById('log-filters-badge');
    if (!badge) return;
    const q = logSearch ? logSearch.value.trim() : '';
    let statusText = activeLevel.charAt(0).toUpperCase() + activeLevel.slice(1);

    if (q) {
        if (activeLevel === 'all') {
            badge.innerText = `"${q}"`;
        } else {
            badge.innerText = `${statusText} · "${q}"`;
        }
        badge.classList.add('badge-active');
    } else {
        badge.innerText = statusText;
        if (activeLevel !== 'all') {
            badge.classList.add('badge-active');
        } else {
            badge.classList.remove('badge-active');
        }
    }
}

function filterTable() {
    for (const tr of logTbody.children) {
        if (tr._entry) {
            const match = matchesFilter(tr._entry);
            tr.classList.toggle('hidden', !match);
        }
    }
    updateCountBadges();
    updateLogFiltersBadge();
}

updateLogFiltersBadge();

// Fallback polling if SSE is blocked by proxy or fails
function pollFallback() {
    if (!isStreaming) return;
    const url = new URL('api/log', location.href);
    fetch(url, { cache: 'no-cache' })
        .then(r => r.text())
        .then(data => {
            const trimmed = data.trim();
            if (!trimmed) {
                clearTable();
                return;
            }
            try {
                const lines = JSON.parse('[' + trimmed.replaceAll('\n', ',') + ']');
                logEntries = lines.slice(-MAX_LOG_ENTRIES);
                renderAll();
            } catch (e) {
                console.error('Failed to parse fallback logs:', e);
            }
        })
        .catch(err => {
            console.error('Fallback log polling error:', err);
        });
}

// Connect Real-Time SSE Stream
function connectStream() {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    if (!isStreaming) return;

    let isInitialBatch = true;
    const initialBuffer = [];

    const url = new URL('api/log?stream=1', location.href);
    eventSource = new EventSource(url);

    eventSource.onopen = () => {
        autoBadge.className = 'badge badge-online';
        autoBadge.innerHTML = '<span class="pulse-indicator"></span>Live Stream';
        if (fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
        }
    };

    eventSource.onmessage = (e) => {
        if (!e.data) return;
        try {
            const entry = JSON.parse(e.data);
            if (entry.level === 'clear') {
                clearTable();
                return;
            }

            if (isInitialBatch) {
                initialBuffer.push(entry);
            } else {
                appendEntry(entry);
            }
        } catch (err) {
            console.warn('Failed to parse streaming log line:', err);
        }
    };

    // Render the initial history dump in one clean batch after 120ms
    setTimeout(() => {
        if (isInitialBatch) {
            if (initialBuffer.length > 0) {
                logEntries = initialBuffer.slice(-MAX_LOG_ENTRIES);
                renderAll();
            }
            isInitialBatch = false;
        }
    }, 120);

    eventSource.onerror = () => {
        autoBadge.className = 'badge badge-warning';
        autoBadge.innerText = 'Reconnecting...';

        // If SSE fails or 404s (e.g. running older binary), seamlessly activate fallback polling
        if (!fallbackInterval && isStreaming) {
            pollFallback();
            fallbackInterval = setInterval(pollFallback, 5000);
        }
    };
}

// Initialize
updateControlsUI();
connectStream();

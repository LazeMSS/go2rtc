const tbody = document.getElementById('streams');
const selectAll = document.getElementById('selectall');
const filterInput = document.getElementById('stream-filter');
const streamBtn = document.getElementById('btn-stream');
const tableEl = document.getElementById('streams-table');
const tableFooter = document.getElementById('table-footer');
const emptyState = document.getElementById('empty-state');
const emptyIcon = document.getElementById('empty-icon');
const emptyTitle = document.getElementById('empty-title');
const emptySubtext = document.getElementById('empty-subtext');
const emptyBtnAdd = document.getElementById('empty-btn-add');

const metricTotal = document.getElementById('metric-total');
const metricActive = document.getElementById('metric-active');
const metricSelected = document.getElementById('metric-selected');
const filterLiveCount = document.getElementById('filter-live-count');

const thStreamName = document.getElementById('th-stream-name');
const sortIndicator = document.getElementById('sort-indicator');
const sortBadge = document.getElementById('sort-badge');

let currentStatusFilter = 'all';
let currentSort = 'config'; // 'config' | 'asc' | 'desc'
let configOrder = [];

function updateSortIndicator() {
    if (!thStreamName || !sortIndicator) return;

    thStreamName.classList.remove('sort-asc', 'sort-desc', 'sort-config');

    if (currentSort === 'asc') {
        thStreamName.classList.add('sort-asc');
        thStreamName.title = 'Sorted A to Z (Click to sort Z to A)';
        sortIndicator.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>';
        if (sortBadge) {
            sortBadge.innerText = 'A-Z';
            sortBadge.classList.remove('hidden');
        }
    } else if (currentSort === 'desc') {
        thStreamName.classList.add('sort-desc');
        thStreamName.title = 'Sorted Z to A (Click to reset to Config Order)';
        sortIndicator.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
        if (sortBadge) {
            sortBadge.innerText = 'Z-A';
            sortBadge.classList.remove('hidden');
        }
    } else {
        thStreamName.classList.add('sort-config');
        thStreamName.title = 'Sorted by Config YAML (Click to sort A to Z)';
        sortIndicator.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z"/></svg>';
        if (sortBadge) {
            sortBadge.innerText = 'Config';
            sortBadge.classList.remove('hidden');
        }
    }
}

function applySort() {
    const rows = Array.from(tbody.querySelectorAll('tr[data-id]'));
    if (rows.length === 0) {
        updateSortIndicator();
        return;
    }

    rows.sort((a, b) => {
        const nameA = a.dataset.id || '';
        const nameB = b.dataset.id || '';

        if (currentSort === 'asc') {
            return nameA.localeCompare(nameB, undefined, {numeric: true, sensitivity: 'base'});
        } else if (currentSort === 'desc') {
            return nameB.localeCompare(nameA, undefined, {numeric: true, sensitivity: 'base'});
        } else {
            const idxA = configOrder.indexOf(nameA);
            const idxB = configOrder.indexOf(nameB);
            const posA = idxA >= 0 ? idxA : 999999;
            const posB = idxB >= 0 ? idxB : 999999;
            return posA - posB;
        }
    });

    rows.forEach(tr => tbody.appendChild(tr));
    updateSortIndicator();
}

if (thStreamName) {
    thStreamName.addEventListener('click', () => {
        if (currentSort === 'config') {
            currentSort = 'asc';
        } else if (currentSort === 'asc') {
            currentSort = 'desc';
        } else {
            currentSort = 'config';
        }
        applySort();
        applyFilter();
    });
}


// Status filter buttons (All / Live / Idle)
document.querySelectorAll('#status-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStatusFilter = btn.dataset.filter;
        applyFilter();
    });
});

// Helper to get comma-separated checked streaming modes
function getSelectedModes() {
    const modeInputs = document.querySelectorAll('.modes-group input');
    return Array.from(modeInputs).filter(i => i.checked).map(i => i.name).join(',');
}

function getSelectedModesParam() {
    const m = getSelectedModes();
    return m ? `&mode=${m}` : '';
}

// Update chip styling and dynamically update all play links when mode checkboxes toggle
document.querySelectorAll('.mode-chip input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
        input.parentElement.classList.toggle('active', input.checked);
        updatePlayLinks();
    });
});

function updatePlayLinks() {
    const param = getSelectedModesParam();
    tbody.querySelectorAll('a[data-src]').forEach(link => {
        const src = link.dataset.src;
        link.href = `stream.html?src=${src}${param}`;
    });
}

// Stream Selected button handler
streamBtn.addEventListener('click', () => {
    const url = new URL('stream.html', location.href);

    const streams = document.querySelectorAll('#streams input[type="checkbox"][name]');
    streams.forEach(i => {
        if (i.checked) url.searchParams.append('src', i.name);
    });

    if (!url.searchParams.has('src')) {
        window.showToast('Please select at least one stream to play.', 'warning');
        return;
    }

    const mode = getSelectedModes();
    if (mode) {
        url.searchParams.set('mode', mode);
    }

    window.location.href = url.toString();
});

// Select all checkbox
selectAll.addEventListener('change', ev => {
    document.querySelectorAll('#streams input[type="checkbox"][name]').forEach(el => {
        const tr = el.closest('tr');
        if (!tr || !tr.classList.contains('hidden')) {
            el.checked = ev.target.checked;
        }
    });
    updateSelectedCount();
});

// Track selected count
function updateSelectedCount() {
    const checked = document.querySelectorAll('#streams input[type="checkbox"][name]:checked').length;
    metricSelected.innerText = checked;
}

tbody.addEventListener('change', ev => {
    if (ev.target.type === 'checkbox') {
        updateSelectedCount();
    }
});

// Client-side search and status filter
filterInput.addEventListener('input', applyFilter);

function applyFilter() {
    const q = filterInput.value.trim().toLowerCase();
    const rows = tbody.querySelectorAll('tr[data-id]');
    const totalRows = rows.length;
    let visibleCount = 0;

    rows.forEach(tr => {
        const name = tr.dataset.id.toLowerCase();
        const isOnline = tr.dataset.online === 'true';

        const matchesText = !q || name.includes(q);
        let matchesStatus = true;
        if (currentStatusFilter === 'live') {
            matchesStatus = isOnline;
        } else if (currentStatusFilter === 'idle') {
            matchesStatus = !isOnline;
        }

        const isVisible = matchesText && matchesStatus;
        tr.classList.toggle('hidden', !isVisible);
        if (isVisible) visibleCount++;
    });

    if (totalRows === 0) {
        emptyState.classList.remove('hidden');
        emptyIcon.innerHTML = '<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>';
        emptyTitle.innerText = 'No cameras configured';
        emptySubtext.innerText = 'Add your first camera stream to get started.';
        emptyBtnAdd.classList.remove('hidden');
        tableEl.classList.add('hidden');
        tableFooter.classList.add('hidden');
    } else if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
        emptyIcon.innerHTML = '<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>';
        emptyTitle.innerText = 'No matching streams found';
        emptySubtext.innerText = 'Try changing your search term or status filter.';
        emptyBtnAdd.classList.add('hidden');
        tableEl.classList.remove('hidden');
        tableFooter.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        tableEl.classList.remove('hidden');
        tableFooter.classList.remove('hidden');
    }
}

// Stream row command delegations
tbody.addEventListener('click', async ev => {
    const delBtn = ev.target.closest('[data-action="delete"]');
    if (!delBtn) return;

    ev.preventDefault();
    const src = decodeURIComponent(delBtn.dataset.name);

    const confirmed = await window.showModal({
        title: `Delete Camera "${src}"`,
        message: `Are you sure you want to delete this camera stream? This action is permanent and will remove it from the active configuration.`,
        icon: 'danger',
        confirmText: 'Delete Camera',
        isDanger: true,
        input: {
            placeholder: `Type "${src}" to confirm deletion`,
            expectedValue: src
        }
    });

    if (!confirmed) {
        return;
    }

    const url = new URL('api/streams', location.href);
    url.searchParams.set('src', src);

    try {
        const r = await fetch(url, {method: 'DELETE'});
        if (r.ok) {
            reload();
            window.showToast(`Camera "${src}" was deleted successfully.`, 'success');
        } else {
            window.showToast(`Failed to delete camera: ${await r.text()}`, 'error');
        }
    } catch (error) {
        window.showToast(`Network error: ${error.message}`, 'error');
    }
});

// Render and synchronize streams table from stream state data
function updateStreamsTable(data) {
    if (!data) return;

    const checkboxStates = {};
    tbody.querySelectorAll('input[type="checkbox"][name]').forEach(checkbox => {
        checkboxStates[checkbox.name] = checkbox.checked;
    });

    const existingIds = Array.from(tbody.querySelectorAll('tr[data-id]')).map(tr => tr.dataset.id);
    const fetchedIds = [];
    let totalConsumers = 0;
    let liveCount = 0;
    const streamEntries = Object.entries(data);

    metricTotal.innerText = streamEntries.length;

    // Track stream keys in original arrival / config order
    for (const key of Object.keys(data)) {
        const name = key.replace(/[<">]/g, '');
        if (!configOrder.includes(name)) {
            configOrder.push(name);
        }
    }
    configOrder = configOrder.filter(name => Object.prototype.hasOwnProperty.call(data, name));

    for (const [key, value] of streamEntries) {

        const name = key.replace(/[<">]/g, ''); // sanitize
        fetchedIds.push(name);

        let tr = tbody.querySelector(`tr[data-id="${name}"]`);
        const online = (value && value.consumers) ? value.consumers.length : 0;
        totalConsumers += online;
        if (online > 0) liveCount++;
        const src = encodeURIComponent(name);
        const modeParam = getSelectedModesParam();

        if (!tr) {
            tr = document.createElement('tr');
            tr.dataset.id = name;
            tbody.appendChild(tr);
        }

        tr.dataset.online = (online > 0).toString();
        const isChecked = checkboxStates[name] ? 'checked' : '';

        // Status badge rendering: non-clickable indicator showing pulse dot + count when active, or 'idle'
        const statusBadge = online > 0
            ? `<span class="badge badge-online" title="${online} active viewers"><span class="pulse-indicator"></span>${online}</span>`
            : `<span class="badge badge-idle" title="No active viewers">idle</span>`;

        // Net diagnostic button: enabled only when active consumers exist
        const netButton = online > 0
            ? `<a href="net.html?src=${src}" class="action-pill btn-sm" title="Network stats">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                <span class="btn-text">Net</span>
            </a>`
            : `<span class="action-pill btn-sm disabled" title="No active network stream">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                <span class="btn-text">Net</span>
            </span>`;

        tr.innerHTML = `
            <td class="text-center">
                <input type="checkbox" name="${name}" ${isChecked}>
            </td>
            <td>
                <div class="stream-name-cell">
                    <a href="stream.html?src=${src}${modeParam}" data-src="${src}" class="stream-name-title" title="Open stream viewer">${name}</a>
                </div>
            </td>
            <td>
                <div class="status-group">
                    ${statusBadge}
                    <a href="api/streams?src=${src}&video=all&audio=all&microphone" class="action-pill btn-sm" title="Probe codecs">
                        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                        <span class="btn-text">Probe</span>
                    </a>
                    ${netButton}
                </div>
            </td>
            <td class="text-right">
                <div class="actions-cell actions-cell-right">
                    <a href="stream.html?src=${src}${modeParam}" data-src="${src}" class="action-pill action-stream" title="Live stream">
                        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        <span class="btn-text">Stream</span>
                    </a>
                    <a href="links.html?src=${src}" class="action-pill" title="Stream URLs & embeds">
                        <svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                        <span class="btn-text">Links</span>
                    </a>
                    <a href="#" data-name="${src}" data-action="delete" class="action-pill action-delete" title="Delete stream">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        <span class="btn-text">Delete</span>
                    </a>
                </div>
            </td>
        `;
    }

    metricActive.innerText = totalConsumers;
    filterLiveCount.innerText = liveCount;
    updateSelectedCount();

    // Remove obsolete rows
    existingIds.forEach(id => {
        if (!fetchedIds.includes(id)) {
            const trToRemove = tbody.querySelector(`tr[data-id="${id}"]`);
            if (trToRemove) tbody.removeChild(trToRemove);
        }
    });

    applySort();
    applyFilter();
}

// Fetch streams data on demand
function reload() {
    const url = new URL('api/streams', location.href);
    fetch(url, {cache: 'no-cache'})
        .then(r => r.json())
        .then(data => updateStreamsTable(data))
        .catch(err => console.error('Failed to reload streams:', err));
}

let pollTimer = null;

function startPolling(intervalMs = 2000) {
    if (pollTimer) return;
    pollTimer = setInterval(reload, intervalMs);
}

function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}

// Real-time EventSource connection with seamless fallback
function connectEvents() {
    if (!window.EventSource) {
        startPolling(2000);
        return;
    }

    let es = null;
    let failureCount = 0;

    try {
        es = new EventSource(new URL('api/events', location.href));

        es.addEventListener('streams', (e) => {
            failureCount = 0;
            stopPolling(); // SSE active, stop polling
            try {
                const data = JSON.parse(e.data);
                updateStreamsTable(data);
            } catch (err) {
                console.error('Failed to parse streams event:', err);
            }
        });

        es.onmessage = (e) => {
            failureCount = 0;
            stopPolling();
            try {
                const data = JSON.parse(e.data);
                updateStreamsTable(data);
            } catch (err) {}
        };

        es.onerror = () => {
            failureCount++;
            // If SSE is unavailable (e.g. 404 before server restart), fall back to polling
            startPolling(2000);
            if (failureCount >= 3) {
                // Temporarily close and retry connecting to SSE after 15 seconds
                es.close();
                setTimeout(connectEvents, 15000);
            }
        };

        // Low-frequency safety poll every 30 seconds
        setInterval(reload, 30000);
    } catch (e) {
        startPolling(2000);
    }
}

// Initial load & real-time connection
updateSortIndicator();
reload();
connectEvents();

// Fetch system version and config info
fetch(new URL('api', location.href), {cache: 'no-cache'})
    .then(r => r.json())
    .then(data => {
        const info = document.getElementById('footer-info');
        if (info) {
            info.innerText = `Version: ${data.version || 'unknown'} • Config: ${data.config_path || 'default'}`;
        }
    })
    .catch(() => {});


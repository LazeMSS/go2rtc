/* global vis */
window.addEventListener('load', () => {
    const url = new URL('api/streams.dot' + location.search, location.href);

    const container = document.getElementById('network');
    const emptyState = document.getElementById('empty-state');
    const statusBadge = document.getElementById('network-status');
    const nodesBadge = document.getElementById('network-nodes');
    const btnFit = document.getElementById('btn-fit');
    const wrapper = document.getElementById('network-wrapper');

    const layout = () => {
        if (wrapper) {
            const top = wrapper.getBoundingClientRect().top;
            const h = Math.max(300, window.innerHeight - top - 24);
            wrapper.style.height = `${h}px`;
        }
    };
    window.addEventListener('resize', layout);
    layout();

    function getNetworkOptions(isDark) {
        return {
            edges: {
                font: {align: 'middle', color: isDark ? '#9ca3af' : '#475569', face: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'},
                smooth: {type: 'continuous'},
                color: {color: isDark ? '#3b82f6' : '#2563eb', highlight: '#60a5fa'},
            },
            nodes: {
                shape: 'box',
                font: {color: isDark ? '#f9fafb' : '#0f172a', face: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'},
                color: {
                    background: isDark ? '#1f2937' : '#ffffff',
                    border: isDark ? '#374151' : '#cbd5e1',
                    highlight: {
                        background: isDark ? '#374151' : '#f1f5f9',
                        border: '#3b82f6'
                    }
                },
                margin: 10,
            },
            physics: false,
        };
    }

    const isInitialDark = window.isDarkMode ? window.isDarkMode() : (document.documentElement.getAttribute('data-theme') !== 'light');
    let options = getNetworkOptions(isInitialDark);

    window.addEventListener('themechange', (e) => {
        options = getNetworkOptions(e.detail.isDark);
        if (network) network.setOptions(options);
    });

    let network;

    async function update() {
        try {
            const response = await fetch(url, {cache: 'no-cache'});
            const dotData = await response.text();
            const data = vis.parseDOTNetwork(dotData);

            const hasActive = data.nodes && data.nodes.length > 0;

            if (!hasActive) {
                emptyState.classList.remove('hidden');
                statusBadge.className = 'badge badge-idle';
                statusBadge.innerHTML = 'Idle';
                nodesBadge.classList.add('hidden');
                btnFit.disabled = true;
            } else {
                emptyState.classList.add('hidden');
                statusBadge.className = 'badge badge-online';
                statusBadge.innerHTML = '<span class="pulse-indicator"></span>Active';
                nodesBadge.classList.remove('hidden');
                nodesBadge.innerText = `${data.nodes.length} Nodes, ${data.edges ? data.edges.length : 0} Edges`;
                btnFit.disabled = false;

                if (!network) {
                    network = new vis.Network(container, data, options);
                    network.storePositions();
                } else {
                    const positions = network.getPositions();
                    const viewPosition = network.getViewPosition();
                    const scale = network.getScale();
                    const selectedNodes = network.getSelectedNodes();

                    network.setData(data);

                    for (const nodeId in positions) {
                        network.moveNode(nodeId, positions[nodeId].x, positions[nodeId].y);
                    }

                    network.moveTo({position: viewPosition, scale: scale});
                    network.selectNodes(selectedNodes);
                }
            }
        } catch (error) {
            console.error('Error fetching or updating network data:', error);
        }

        setTimeout(update, 5000);
    }

    btnFit.addEventListener('click', () => {
        if (network) network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    });

    document.getElementById('btn-refresh').addEventListener('click', () => {
        update();
    });

    update();
});


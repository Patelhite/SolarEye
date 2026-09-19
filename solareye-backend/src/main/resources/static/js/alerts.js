/**
 * SolarEye — Real-Time Alert Manager & Incident Resolution Controller
 */

const AlertsManager = {
    currentFilter: 'ALL',

    init() {
        this.bindEvents();
        this.fetchAlerts();
    },

    bindEvents() {
        // Filter tabs
        const filterBtns = document.querySelectorAll('.btn-alert-filter');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter') || 'ALL';
                this.renderAlertList(AppState.activeAlerts);
            });
        });

        // Banner dismiss
        document.getElementById('btnDismissBanner')?.addEventListener('click', () => {
            document.getElementById('criticalAlertBanner')?.classList.add('d-none');
        });

        // Banner resolve
        document.getElementById('btnBannerResolve')?.addEventListener('click', () => {
            const firstRed = (AppState.activeAlerts || []).find(a => a.severity === 'RED');
            if (firstRed) {
                this.resolveAlert(firstRed.id);
            }
        });
    },

    async fetchAlerts() {
        try {
            const res = await Api.getActiveAlerts();
            if (res.success && Array.isArray(res.data)) {
                AppState.activeAlerts = res.data;
                this.updateAlertCounts(res.data);
                this.renderAlertList(res.data);
                this.updateCriticalBanner(res.data);
            }
        } catch (e) {
            console.warn('[Alerts Fetch Error]:', e);
        }
    },

    updateAlertCounts(alerts) {
        const total = alerts.length;
        const redCount = alerts.filter(a => a.severity === 'RED').length;
        const yellowCount = alerts.filter(a => a.severity === 'YELLOW').length;

        const countBadge = document.getElementById('activeAlertCountBadge');
        const elAll = document.getElementById('countAllAlerts');
        const elRed = document.getElementById('countRedAlerts');
        const elYellow = document.getElementById('countYellowAlerts');

        if (countBadge) {
            countBadge.textContent = `${total} Active`;
            countBadge.className = total > 0 
                ? (redCount > 0 ? 'badge bg-danger rounded-pill px-2 py-1' : 'badge bg-warning text-dark rounded-pill px-2 py-1') 
                : 'badge bg-success rounded-pill px-2 py-1';
        }
        if (elAll) elAll.textContent = total;
        if (elRed) elRed.textContent = redCount;
        if (elYellow) elYellow.textContent = yellowCount;
    },

    updateCriticalBanner(alerts) {
        const banner = document.getElementById('criticalAlertBanner');
        const firstRed = alerts.find(a => a.severity === 'RED');

        if (!banner) return;

        if (firstRed) {
            banner.classList.remove('d-none');
            const title = document.getElementById('bannerAlertTitle');
            const msg = document.getElementById('bannerAlertMsg');
            if (title) title.textContent = `🚨 ${firstRed.alertType || 'CRITICAL SYSTEM ANOMALY'}`;
            if (msg) msg.textContent = firstRed.message || 'System anomaly detected in live telemetry.';
        } else {
            banner.classList.add('d-none');
        }
    },

    renderAlertList(alerts) {
        const container = document.getElementById('alertFeedContainer');
        const placeholder = document.getElementById('noAlertsPlaceholder');

        if (!container) return;

        let filtered = alerts;
        if (this.currentFilter === 'RED') filtered = alerts.filter(a => a.severity === 'RED');
        if (this.currentFilter === 'YELLOW') filtered = alerts.filter(a => a.severity === 'YELLOW');

        if (!filtered || filtered.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-muted" id="noAlertsPlaceholder">
                    <i class="fa-solid fa-shield-check text-success fa-2x mb-2 d-block"></i>
                    <span class="fw-semibold">No active alerts matching filter.</span>
                    <p class="small text-muted mb-0">All telemetry values are in normal operational range.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(alert => {
            const isRed = alert.severity === 'RED';
            const borderClass = isRed ? 'border-red' : 'border-yellow';
            const badgeClass = isRed ? 'badge-severity-red' : 'badge-severity-yellow';
            const icon = isRed ? 'fa-triangle-exclamation text-danger' : 'fa-circle-exclamation text-warning';

            return `
                <div class="alert-item-card ${borderClass}" id="alert-item-${alert.id}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <i class="fa-solid ${icon}"></i>
                            <span class="fw-bold text-light font-outfit">${this.escapeHtml(alert.alertType || 'ALERT')}</span>
                        </div>
                        <span class="badge ${badgeClass} px-2 py-1">${alert.severity || 'WARN'}</span>
                    </div>
                    <p class="small text-light-emphasis mb-2">${this.escapeHtml(alert.message)}</p>
                    <div class="d-flex justify-content-between align-items-center pt-2 border-top border-glass">
                        <span class="small text-muted"><i class="fa-regular fa-clock me-1"></i> ${alert.createdAt || 'Just now'}</span>
                        <button class="btn btn-resolve-alert" onclick="AlertsManager.resolveAlert(${alert.id})">
                            <i class="fa-solid fa-check me-1"></i> Resolve
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    async resolveAlert(id) {
        try {
            const res = await Api.resolveAlert(id);
            if (res.success) {
                // Optimistic UI update
                AppState.activeAlerts = (AppState.activeAlerts || []).filter(a => a.id !== id);
                this.updateAlertCounts(AppState.activeAlerts);
                this.renderAlertList(AppState.activeAlerts);
                this.updateCriticalBanner(AppState.activeAlerts);
                this.showToast(`Alert #${id} successfully resolved.`, 'success');
            }
        } catch (e) {
            this.showToast(e.message || 'Failed to resolve alert.', 'danger');
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const id = 'toast-' + Date.now();
        const icon = type === 'success' ? 'fa-circle-check text-success' 
                   : (type === 'danger' ? 'fa-triangle-exclamation text-danger' : 'fa-circle-info text-solar-cyan');

        const toastHtml = `
            <div class="toast toast-glass align-items-center show mb-2" id="${id}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex p-2">
                    <div class="toast-body d-flex align-items-center gap-2">
                        <i class="fa-solid ${icon} fs-5"></i>
                        <span>${this.escapeHtml(message)}</span>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHtml);
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.remove();
        }, 4000);
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }
};

window.AlertsManager = AlertsManager;

/**
 * SolarEye — Streamlined Alert Manager
 */

const AlertsManager = {
    init() {
        this.bindEvents();
        this.fetchAlerts();
    },

    bindEvents() {
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
        const countBadge = document.getElementById('activeAlertCountBadge');
        const pillAlerts = document.getElementById('pillActiveAlerts');

        if (countBadge) {
            countBadge.textContent = `${total} Active`;
            countBadge.className = total > 0 ? 'badge bg-danger rounded-pill px-2 py-1' : 'badge bg-success rounded-pill px-2 py-1';
        }
        if (pillAlerts) {
            pillAlerts.textContent = total;
            pillAlerts.className = total > 0 ? 'font-outfit text-danger' : 'font-outfit text-success';
        }
    },

    updateCriticalBanner(alerts) {
        const banner = document.getElementById('criticalAlertBanner');
        const firstRed = alerts.find(a => a.severity === 'RED');

        if (!banner) return;

        if (firstRed) {
            banner.classList.remove('d-none');
            const title = document.getElementById('bannerAlertTitle');
            const msg = document.getElementById('bannerAlertMsg');
            if (title) title.textContent = `🚨 ${firstRed.alertType || 'CRITICAL INCIDENT'}`;
            if (msg) msg.textContent = firstRed.message || 'System anomaly detected.';
        } else {
            banner.classList.add('d-none');
        }
    },

    renderAlertList(alerts) {
        const container = document.getElementById('alertFeedContainer');
        if (!container) return;

        if (!alerts || alerts.length === 0) {
            container.innerHTML = `
                <div class="p-3 text-center text-muted small" id="noAlertsPlaceholder">
                    <i class="fa-solid fa-shield-check text-success fa-lg me-1"></i> No active incidents.
                </div>
            `;
            return;
        }

        container.innerHTML = alerts.map(alert => {
            const isRed = alert.severity === 'RED';
            const borderClass = isRed ? 'border-red' : 'border-yellow';
            const icon = isRed ? 'fa-triangle-exclamation text-danger' : 'fa-circle-exclamation text-warning';
            const timeOnly = alert.createdAt ? alert.createdAt.split(' ')[1] || alert.createdAt : 'Now';

            return `
                <div class="alert-item-card ${borderClass}" id="alert-item-${alert.id}">
                    <div class="d-flex align-items-center gap-2 text-truncate me-2">
                        <i class="fa-solid ${icon} small"></i>
                        <span class="small fw-semibold text-light text-truncate">${this.escapeHtml(alert.alertType || 'Alert')}</span>
                        <span class="micro-label text-muted">${timeOnly}</span>
                    </div>
                    <button class="btn btn-resolve-alert flex-shrink-0" onclick="AlertsManager.resolveAlert(${alert.id})">
                        <i class="fa-solid fa-check me-1"></i> Resolve
                    </button>
                </div>
            `;
        }).join('');
    },

    async resolveAlert(id) {
        try {
            const res = await Api.resolveAlert(id);
            if (res.success) {
                AppState.activeAlerts = (AppState.activeAlerts || []).filter(a => a.id !== id);
                this.updateAlertCounts(AppState.activeAlerts);
                this.renderAlertList(AppState.activeAlerts);
                this.updateCriticalBanner(AppState.activeAlerts);
                this.showToast(`Incident #${id} resolved.`, 'success');
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
            <div class="toast toast-glass align-items-center show mb-2" id="${id}" role="alert">
                <div class="d-flex p-2">
                    <div class="toast-body d-flex align-items-center gap-2">
                        <i class="fa-solid ${icon}"></i>
                        <span>${this.escapeHtml(message)}</span>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHtml);
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.remove();
        }, 3500);
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }
};

window.AlertsManager = AlertsManager;

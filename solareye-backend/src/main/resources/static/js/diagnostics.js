/**
 * SolarEye — Executive Predictive Maintenance Controller
 */

const Diagnostics = {
    init() {
        this.fetchPredictions();
    },

    async fetchPredictions() {
        try {
            const [statusRes, predictionsRes] = await Promise.all([
                Api.getPredictionsStatus().catch(() => null),
                Api.getPredictions().catch(() => null)
            ]);

            const overallStatus = (statusRes && statusRes.data) ? statusRes.data : 'HEALTHY';
            this.updateOverallBadge(overallStatus);

            const predictions = (predictionsRes && predictionsRes.data) ? predictionsRes.data : [];
            AppState.predictions = predictions;

            this.renderRecommendations(predictions);
            this.evaluateLiveTelemetryRules(AppState.latestTelemetry);

        } catch (e) {
            console.warn('[Diagnostics Fetch Error]:', e);
        }
    },

    updateOverallBadge(status) {
        const badge = document.getElementById('predictiveOverallStatus');
        if (!badge) return;

        badge.textContent = status;

        if (status === 'CRITICAL') {
            badge.className = 'badge bg-danger text-white px-3 py-1 font-outfit';
        } else if (status === 'WARNING') {
            badge.className = 'badge bg-warning text-dark px-3 py-1 font-outfit';
        } else if (status === 'ATTENTION') {
            badge.className = 'badge bg-info text-white px-3 py-1 font-outfit';
        } else {
            badge.className = 'badge bg-success-subtle text-success px-3 py-1 font-outfit';
        }
    },

    evaluateLiveTelemetryRules(telemetry) {
        if (!telemetry) return;

        const { voltage, current, power, temperature, lightIntensity } = telemetry;

        // 1. Dust Status
        const badgeSoiling = document.getElementById('badgeSoiling');
        if (lightIntensity > 500 && power < 2.0 && current < 0.5) {
            if (badgeSoiling) { badgeSoiling.textContent = 'Warning'; badgeSoiling.className = 'badge bg-warning text-dark'; }
        } else {
            if (badgeSoiling) { badgeSoiling.textContent = 'Clean'; badgeSoiling.className = 'badge bg-success-subtle text-success'; }
        }

        // 2. Hotspot / Thermal Status
        const badgeThermal = document.getElementById('badgeThermal');
        if (temperature >= 50.0) {
            if (badgeThermal) { badgeThermal.textContent = 'Overheat'; badgeThermal.className = 'badge bg-danger'; }
        } else if (temperature >= 45.0) {
            if (badgeThermal) { badgeThermal.textContent = 'Alert'; badgeThermal.className = 'badge bg-warning text-dark'; }
        } else {
            if (badgeThermal) { badgeThermal.textContent = 'Normal'; badgeThermal.className = 'badge bg-success-subtle text-success'; }
        }

        // 3. Voltage Variance Status
        const badgeVoltage = document.getElementById('badgeVoltageDegradation');
        if (voltage < 5.0 && lightIntensity > 300) {
            if (badgeVoltage) { badgeVoltage.textContent = 'Unstable'; badgeVoltage.className = 'badge bg-danger'; }
        } else {
            if (badgeVoltage) { badgeVoltage.textContent = 'Stable'; badgeVoltage.className = 'badge bg-success-subtle text-success'; }
        }

        // 4. Sensor Stream Status
        const badgeSensor = document.getElementById('badgeSensorIntegrity');
        if (badgeSensor) {
            badgeSensor.textContent = 'Online';
            badgeSensor.className = 'badge bg-success-subtle text-success';
        }
    },

    renderRecommendations(predictions) {
        const container = document.getElementById('predictionRecommendationList');
        if (!container) return;

        if (!predictions || predictions.length === 0) {
            container.innerHTML = `
                <span class="action-tag text-success"><i class="fa-solid fa-circle-check me-1"></i> All Sub-systems Nominal</span>
            `;
            return;
        }

        container.innerHTML = predictions.map(p => {
            const isCritical = p.status === 'CRITICAL';
            const tagClass = isCritical ? 'action-tag-danger' : 'action-tag-warning';
            const icon = isCritical ? 'fa-triangle-exclamation' : 'fa-wrench';

            return `
                <span class="action-tag ${tagClass}">
                    <i class="fa-solid ${icon} me-1"></i> ${this.escapeHtml(p.recommendation || p.predictionType || 'Inspect System')}
                </span>
            `;
        }).join('');
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }
};

window.Diagnostics = Diagnostics;

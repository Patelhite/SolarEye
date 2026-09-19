/**
 * SolarEye — AI Predictive Maintenance & Diagnostics Controller
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

            const overallStatus = (statusRes && statusRes.data) ? statusRes.data : 'OK';
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
        const dot = document.getElementById('predictiveStatusDot');
        const label = document.getElementById('predictiveOverallStatus');

        if (!dot || !label) return;

        label.textContent = status;

        if (status === 'CRITICAL') {
            dot.className = 'status-dot bg-danger';
            label.className = 'status-label text-danger fw-bold';
        } else if (status === 'WARNING') {
            dot.className = 'status-dot bg-warning';
            label.className = 'status-label text-warning fw-bold';
        } else if (status === 'ATTENTION') {
            dot.className = 'status-dot bg-info';
            label.className = 'status-label text-info fw-bold';
        } else {
            dot.className = 'status-dot dot-live';
            label.className = 'status-label text-success fw-bold';
        }
    },

    /**
     * Evaluates live telemetry values against physical solar domain rules
     */
    evaluateLiveTelemetryRules(telemetry) {
        if (!telemetry) return;

        const { voltage, current, power, temperature, lightIntensity } = telemetry;

        // 1. Dust & Soiling Detection Rule
        // High Light (>500 Lux) but Very Low Current/Power (<2W)
        const cardSoiling = document.getElementById('ruleDustSoiling');
        const badgeSoiling = document.getElementById('badgeSoiling');
        const descSoiling = document.getElementById('descSoiling');

        if (lightIntensity > 500 && power < 2.0 && current < 0.5) {
            cardSoiling?.classList.add('state-warning');
            if (badgeSoiling) { badgeSoiling.textContent = 'DUST DETECTED'; badgeSoiling.className = 'badge bg-warning text-dark'; }
            if (descSoiling) descSoiling.textContent = `High solar irradiance (${Math.round(lightIntensity)} Lux) but low output (${power}W). Surface cleaning required.`;
        } else {
            cardSoiling?.classList.remove('state-warning');
            if (badgeSoiling) { badgeSoiling.textContent = 'CLEAN'; badgeSoiling.className = 'badge bg-success-subtle text-success'; }
            if (descSoiling) descSoiling.textContent = 'Panel surface transparency is optimal. Irradiance-to-power conversion is nominal.';
        }

        // 2. Thermal Hotspot / Fault Rule
        const cardThermal = document.getElementById('ruleThermalFault');
        const badgeThermal = document.getElementById('badgeThermal');
        const descThermal = document.getElementById('descThermal');

        if (temperature >= 50.0) {
            cardThermal?.classList.add('state-critical');
            if (badgeThermal) { badgeThermal.textContent = 'OVERHEATING'; badgeThermal.className = 'badge bg-danger'; }
            if (descThermal) descThermal.textContent = `Dangerous panel temperature (${temperature}°C). Risk of cell degradation and thermal runaway.`;
        } else if (temperature >= 45.0) {
            cardThermal?.classList.add('state-warning');
            if (badgeThermal) { badgeThermal.textContent = 'WARM (DERATING)'; badgeThermal.className = 'badge bg-warning text-dark'; }
            if (descThermal) descThermal.textContent = `Elevated temperature (${temperature}°C). Thermal efficiency derating active (-10%).`;
        } else {
            cardThermal?.classList.remove('state-critical', 'state-warning');
            if (badgeThermal) { badgeThermal.textContent = 'NORMAL'; badgeThermal.className = 'badge bg-success-subtle text-success'; }
            if (descThermal) descThermal.textContent = `Panel temperature (${temperature}°C) within standard operating range (<45°C).`;
        }

        // 3. Voltage Degradation / Fluctuation Rule
        const cardVoltage = document.getElementById('ruleVoltageDegradation');
        const badgeVoltage = document.getElementById('badgeVoltageDegradation');
        const descVoltage = document.getElementById('descVoltageDegradation');

        if (voltage < 5.0 && lightIntensity > 300) {
            cardVoltage?.classList.add('state-critical');
            if (badgeVoltage) { badgeVoltage.textContent = 'STRING FAULT'; badgeVoltage.className = 'badge bg-danger'; }
            if (descVoltage) descVoltage.textContent = `Abnormal voltage drop (${voltage}V) during daylight. Check bypass diodes and wiring.`;
        } else {
            cardVoltage?.classList.remove('state-critical');
            if (badgeVoltage) { badgeVoltage.textContent = 'STABLE'; badgeVoltage.className = 'badge bg-success-subtle text-success'; }
            if (descVoltage) descVoltage.textContent = `String voltage variance is stable (${voltage}V). Electrical connections are tight.`;
        }
    },

    renderRecommendations(predictions) {
        const container = document.getElementById('predictionRecommendationList');
        if (!container) return;

        if (!predictions || predictions.length === 0) {
            container.innerHTML = `
                <div class="p-3 text-center text-muted small" id="noPredictionsPlaceholder">
                    <i class="fa-solid fa-circle-check text-success fa-2x mb-2 d-block"></i>
                    All solar sub-systems are operating at maximum yield efficiency. No corrective technician intervention required.
                </div>
            `;
            return;
        }

        container.innerHTML = predictions.map(p => {
            const confidence = p.confidence ? `${Math.round(p.confidence)}%` : '85%';
            const priorityClass = p.status === 'CRITICAL' ? 'prescription-priority-high' 
                                : (p.status === 'WARNING' ? 'prescription-priority-medium' : 'prescription-priority-low');

            return `
                <div class="prescription-item ${priorityClass}">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="fw-bold font-outfit text-light">${this.escapeHtml(p.predictionType || 'MAINTENANCE_ACTION')}</span>
                            <span class="confidence-chip">Confidence ${confidence}</span>
                        </div>
                        <p class="small text-light-emphasis mb-0">${this.escapeHtml(p.recommendation || p.reason)}</p>
                    </div>
                    <button class="btn btn-sm btn-glass ms-3" onclick="AlertsManager.showToast('Work order generated for solar technician.', 'success')">
                        <i class="fa-solid fa-screwdriver-wrench me-1 text-solar-orange"></i> Action
                    </button>
                </div>
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

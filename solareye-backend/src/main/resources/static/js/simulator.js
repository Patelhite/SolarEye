/**
 * SolarEye — IoT Hardware Simulator & Manual Sensor Ingestion Controller
 */

const Simulator = {
    init() {
        this.bindEvents();
        this.fetchStatus();
    },

    bindEvents() {
        // Toggle simulation engine
        const btnToggle = document.getElementById('btnToggleSimulationEngine');
        if (btnToggle) {
            btnToggle.addEventListener('click', () => this.toggleSimulation());
        }

        // Manual ingestion form
        const formInject = document.getElementById('formManualDataInject');
        if (formInject) {
            formInject.addEventListener('submit', (e) => this.handleManualIngest(e));
        }

        // Quick Presets
        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const v = btn.getAttribute('data-v');
                const i = btn.getAttribute('data-i');
                const t = btn.getAttribute('data-t');
                const h = btn.getAttribute('data-h');
                const l = btn.getAttribute('data-l');

                if (v) document.getElementById('injectVoltage').value = v;
                if (i) document.getElementById('injectCurrent').value = i;
                if (t) document.getElementById('injectTemp').value = t;
                if (h) document.getElementById('injectHumidity').value = h;
                if (l) document.getElementById('injectLight').value = l;

                if (window.AlertsManager) {
                    AlertsManager.showToast(`Preset loaded: ${btn.textContent}`, 'info');
                }
            });
        });
    },

    async fetchStatus() {
        try {
            const res = await Api.getSimulationStatus();
            if (res.success && res.data) {
                this.updateUI(res.data.enabled);
            }
        } catch (e) {
            console.warn('[Simulator Status Error]:', e);
        }
    },

    async toggleSimulation() {
        try {
            const res = await Api.toggleSimulation();
            if (res.success && res.data) {
                this.updateUI(res.data.enabled);
                if (window.AlertsManager) {
                    AlertsManager.showToast(
                        res.data.enabled ? 'Background simulator started (5s interval).' : 'Background simulator paused.',
                        'info'
                    );
                }
            }
        } catch (e) {
            if (window.AlertsManager) {
                AlertsManager.showToast('Failed to toggle simulator: ' + e.message, 'danger');
            }
        }
    },

    updateUI(enabled) {
        AppState.simulationActive = enabled;

        const navDot = document.getElementById('simStatusDot');
        const navLabel = document.getElementById('simStatusLabel');
        const modalBadge = document.getElementById('modalSimStatusBadge');
        const btnText = document.getElementById('btnToggleSimText');

        if (navDot) navDot.className = enabled ? 'status-dot dot-sim' : 'status-dot bg-secondary';
        if (navLabel) navLabel.textContent = enabled ? 'Simulator: Active' : 'Simulator: Paused';

        if (modalBadge) {
            modalBadge.textContent = enabled ? 'ENABLED' : 'PAUSED';
            modalBadge.className = enabled ? 'badge bg-success-subtle text-success px-3 py-2' : 'badge bg-secondary-subtle text-muted px-3 py-2';
        }

        if (btnText) {
            btnText.textContent = enabled ? 'Pause Simulator' : 'Resume Simulator';
        }
    },

    async handleManualIngest(e) {
        e.preventDefault();

        const v = parseFloat(document.getElementById('injectVoltage').value);
        const i = parseFloat(document.getElementById('injectCurrent').value);
        const t = parseFloat(document.getElementById('injectTemp').value);
        const h = parseFloat(document.getElementById('injectHumidity').value);
        const l = parseFloat(document.getElementById('injectLight').value);
        const btnSubmit = document.getElementById('btnSubmitInject');

        const payload = {
            voltage: v,
            current: i,
            temperature: t,
            humidity: h,
            lightIntensity: l
        };

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Ingesting...';

        try {
            const res = await Api.ingestSensorData(payload);
            if (res.success && res.data) {
                if (window.AlertsManager) {
                    AlertsManager.showToast(
                        `Telemetry ingested: ${res.data.voltage}V, ${res.data.current}A (${res.data.power}W)`,
                        'success'
                    );
                }

                // Immediately trigger dashboard & alerts refresh
                if (window.Dashboard) window.Dashboard.fetchDashboardData();
                if (window.AlertsManager) window.AlertsManager.fetchAlerts();
                if (window.Diagnostics) window.Diagnostics.fetchPredictions();
                if (window.ChartsController) window.ChartsController.loadChartData(AppState.chartTimeRangeHours);

                // Close modal
                const modalEl = document.getElementById('simulatorModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
        } catch (err) {
            if (window.AlertsManager) {
                AlertsManager.showToast('Data ingestion error: ' + err.message, 'danger');
            }
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i> Push Sensor Telemetry';
        }
    }
};

window.Simulator = Simulator;

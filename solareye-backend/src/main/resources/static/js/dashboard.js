/**
 * SolarEye — Executive Dashboard & Real-Time Metric Telemetry Binder
 */

const Dashboard = {
    init() {
        this.fetchDashboardData();
    },

    async fetchDashboardData() {
        try {
            const [summaryRes, latestRes, analyticsRes] = await Promise.all([
                Api.getDashboardSummary().catch(() => null),
                Api.getLatestSolarData().catch(() => null),
                Api.getAnalyticsSummary().catch(() => null)
            ]);

            if (summaryRes && summaryRes.success && summaryRes.data) {
                AppState.dashboardSummary = summaryRes.data;
                this.renderSummary(summaryRes.data);
            }

            if (latestRes && latestRes.success && latestRes.data) {
                AppState.latestTelemetry = latestRes.data;
                this.renderLatest(latestRes.data);
            }

            if (analyticsRes && analyticsRes.success && analyticsRes.data) {
                AppState.analytics = analyticsRes.data;
                this.renderAnalytics(analyticsRes.data);
            }

        } catch (e) {
            console.warn('[Dashboard Data Sync Error]:', e);
        }
    },

    renderLatest(d) {
        // Voltage
        const v = d.voltage != null ? Number(d.voltage).toFixed(2) : '0.00';
        const elV = document.getElementById('valVoltage');
        const elVChip = document.getElementById('valVoltageChip');
        if (elV) elV.textContent = v;
        if (elVChip) elVChip.textContent = v;

        const vProgress = Math.min(100, Math.max(0, (Number(v) / 24.0) * 100));
        const elVBar = document.getElementById('voltageProgressBar');
        if (elVBar) elVBar.style.width = `${vProgress}%`;

        // Current
        const i = d.current != null ? Number(d.current).toFixed(2) : '0.00';
        const elI = document.getElementById('valCurrent');
        const elIChip = document.getElementById('valCurrentChip');
        if (elI) elI.textContent = i;
        if (elIChip) elIChip.textContent = i;

        const iProgress = Math.min(100, Math.max(0, (Number(i) / 5.5) * 100));
        const elIBar = document.getElementById('currentProgressBar');
        if (elIBar) elIBar.style.width = `${iProgress}%`;

        // Power
        const p = d.power != null ? Number(d.power).toFixed(2) : '0.00';
        const elP = document.getElementById('valPower');
        if (elP) elP.textContent = p;

        const pProgress = Math.min(100, Math.max(0, (Number(p) / 100.0) * 100));
        const elPBar = document.getElementById('powerProgressBar');
        if (elPBar) elPBar.style.width = `${pProgress}%`;

        // Temperature
        const t = d.temperature != null ? Number(d.temperature).toFixed(1) : '0.0';
        const elT = document.getElementById('valTemperature');
        if (elT) elT.textContent = t;

        const tProgress = Math.min(100, Math.max(0, (Number(t) / 70.0) * 100));
        const elTBar = document.getElementById('tempProgressBar');
        if (elTBar) elTBar.style.width = `${tProgress}%`;

        const elTBadge = document.getElementById('tempStatusBadge');
        const elTDerating = document.getElementById('tempDeratingText');
        if (Number(t) >= CONFIG.THRESHOLDS.TEMP_CRITICAL) {
            if (elTBadge) { elTBadge.textContent = 'Critical Heat'; elTBadge.className = 'badge bg-danger'; }
            if (elTDerating) elTDerating.textContent = 'Derating: -15% Yield';
        } else if (Number(t) >= CONFIG.THRESHOLDS.TEMP_WARN) {
            if (elTBadge) { elTBadge.textContent = 'Warning Heat'; elTBadge.className = 'badge bg-warning text-dark'; }
            if (elTDerating) elTDerating.textContent = 'Derating: -5% Yield';
        } else {
            if (elTBadge) { elTBadge.textContent = 'Optimal'; elTBadge.className = 'badge bg-glass-pill text-success'; }
            if (elTDerating) elTDerating.textContent = 'Derating: Nominal';
        }

        // Humidity
        const h = d.humidity != null ? Number(d.humidity).toFixed(1) : '0.0';
        const elH = document.getElementById('valHumidity');
        if (elH) elH.textContent = h;

        const elHBar = document.getElementById('humidityProgressBar');
        if (elHBar) elHBar.style.width = `${Math.min(100, Number(h))}%`;

        // Light Intensity
        const l = d.lightIntensity != null ? Math.round(d.lightIntensity) : 0;
        const elL = document.getElementById('valLight');
        if (elL) elL.textContent = l;

        const lProgress = Math.min(100, Math.max(0, (l / 1200.0) * 100));
        const elLBar = document.getElementById('lightProgressBar');
        if (elLBar) elLBar.style.width = `${lProgress}%`;

        const elLText = document.getElementById('solarDayNightText');
        if (elLText) {
            if (l < 50) {
                elLText.innerHTML = '<i class="fa-solid fa-moon me-1 text-info"></i> Night / Low Light';
            } else if (l < 500) {
                elLText.innerHTML = '<i class="fa-solid fa-cloud-sun me-1 text-warning"></i> Diffuse Sun';
            } else {
                elLText.innerHTML = '<i class="fa-solid fa-sun me-1 text-warning"></i> Peak Daylight';
            }
        }

        // Ingest timestamp
        const elIngest = document.getElementById('lastIngestTime');
        if (elIngest && d.createdAt) {
            elIngest.textContent = d.createdAt;
        }
    },

    renderSummary(s) {
        // Today's Energy
        const energy = s.todayEnergy != null ? (Number(s.todayEnergy) / 1000).toFixed(3) : '0.000';
        const elEnergy = document.getElementById('valTodayEnergy');
        if (elEnergy) elEnergy.textContent = energy;

        const energyProgress = Math.min(100, Math.max(0, (Number(s.todayEnergy) / 5000.0) * 100));
        const elEnergyBar = document.getElementById('energyProgressBar');
        if (elEnergyBar) elEnergyBar.style.width = `${energyProgress}%`;

        // System Health Gauge
        const health = s.systemHealth || 'OPTIMAL';
        const elHealth = document.getElementById('valSystemHealth');
        const elHealthScore = document.getElementById('valHealthScore');
        const elHealthBar = document.getElementById('healthProgressBar');
        const elHealthIcon = document.getElementById('healthBadgeIcon');

        let score = 98;
        let colorClass = 'text-success';
        let barClass = 'bg-success';

        if (health === 'CRITICAL') {
            score = 35;
            colorClass = 'text-danger';
            barClass = 'bg-danger';
        } else if (health === 'FAIR' || health === 'POOR') {
            score = 72;
            colorClass = 'text-warning';
            barClass = 'bg-warning';
        } else if (health === 'GOOD') {
            score = 88;
            colorClass = 'text-info';
            barClass = 'bg-info';
        }

        if (elHealth) {
            elHealth.textContent = health;
            elHealth.className = `metric-value font-outfit mb-0 ${colorClass}`;
        }
        if (elHealthScore) elHealthScore.textContent = `${score}%`;
        if (elHealthBar) {
            elHealthBar.style.width = `${score}%`;
            elHealthBar.className = `progress-bar-health ${barClass}`;
        }
        if (elHealthIcon) {
            elHealthIcon.className = `metric-icon-badge ${colorClass}-subtle ${colorClass}`;
        }

        // Hardware connection status
        const isOnline = s.sensorOnline !== false;
        const elDot = document.getElementById('hardwareStatusDot');
        const elLabel = document.getElementById('hardwareStatusLabel');
        if (elDot) elDot.className = isOnline ? 'status-dot dot-live' : 'status-dot bg-secondary';
        if (elLabel) elLabel.textContent = isOnline ? 'ESP8266 Live' : 'ESP8266 Offline';
    },

    renderAnalytics(a) {
        const elDaily = document.getElementById('analyticsDailyEnergy');
        const elWeekly = document.getElementById('analyticsWeeklyEnergy');
        const elMonthly = document.getElementById('analyticsMonthlyEnergy');
        const elAvgEff = document.getElementById('analyticsAvgEfficiency');
        const elUptime = document.getElementById('analyticsUptime');
        const elReadings = document.getElementById('valReadingsCount');

        if (elDaily) elDaily.innerHTML = `${(Number(a.dailyEnergy || 0) / 1000).toFixed(2)} <span class="fs-6 text-muted">kWh</span>`;
        if (elWeekly) elWeekly.innerHTML = `${(Number(a.weeklyEnergy || 0) / 1000).toFixed(2)} <span class="fs-6 text-muted">kWh</span>`;
        if (elMonthly) elMonthly.innerHTML = `${(Number(a.monthlyEnergy || 0) / 1000).toFixed(2)} <span class="fs-6 text-muted">kWh</span>`;
        if (elAvgEff) elAvgEff.innerHTML = `${Number(a.averageEfficiency || 0).toFixed(1)} <span class="fs-6 text-muted">%</span>`;
        if (elUptime) elUptime.textContent = a.uptimeStatus || `${Number(a.systemUptime || 99.8).toFixed(1)}%`;
        if (elReadings && a.totalReadings) elReadings.textContent = a.totalReadings;
    }
};

window.Dashboard = Dashboard;

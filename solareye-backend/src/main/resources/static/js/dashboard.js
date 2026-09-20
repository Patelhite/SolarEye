/**
 * SolarEye — Executive Dashboard Telemetry Binder
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
            console.warn('[Dashboard Sync Error]:', e);
        }
    },

    renderLatest(d) {
        // Voltage
        const v = d.voltage != null ? Number(d.voltage).toFixed(2) : '0.00';
        const elV = document.getElementById('valVoltage');
        const elVChip = document.getElementById('valVoltageChip');
        if (elV) elV.textContent = v;
        if (elVChip) elVChip.textContent = v;

        // Current
        const i = d.current != null ? Number(d.current).toFixed(2) : '0.00';
        const elI = document.getElementById('valCurrent');
        const elIChip = document.getElementById('valCurrentChip');
        if (elI) elI.textContent = i;
        if (elIChip) elIChip.textContent = i;

        // Power
        const p = d.power != null ? Number(d.power).toFixed(2) : '0.00';
        const elP = document.getElementById('valPower');
        if (elP) elP.textContent = p;

        // Temperature
        const t = d.temperature != null ? Number(d.temperature).toFixed(1) : '0.0';
        const elT = document.getElementById('valTemperature');
        if (elT) elT.textContent = t;

        // Humidity
        const h = d.humidity != null ? Number(d.humidity).toFixed(1) : '0.0';
        const elH = document.getElementById('valHumidity');
        if (elH) elH.textContent = h;

        // Light Intensity
        const l = d.lightIntensity != null ? Math.round(d.lightIntensity) : 0;
        const elL = document.getElementById('valLight');
        if (elL) elL.textContent = l;
    },

    renderSummary(s) {
        // Today's Energy
        const energy = s.todayEnergy != null ? (Number(s.todayEnergy) / 1000).toFixed(3) : '0.000';
        const elEnergy = document.getElementById('valTodayEnergy');
        if (elEnergy) elEnergy.textContent = energy;

        // System Health Status
        const health = s.systemHealth || 'OPTIMAL';
        const elHealth = document.getElementById('valSystemHealth');
        const elHealthScore = document.getElementById('valHealthScore');
        const elHealthIcon = document.getElementById('healthBadgeIcon');
        const elMaintBadge = document.getElementById('maintenanceStatusBadge');

        let score = 98;
        let colorClass = 'text-success';

        if (health === 'CRITICAL') {
            score = 35;
            colorClass = 'text-danger';
        } else if (health === 'FAIR' || health === 'POOR') {
            score = 72;
            colorClass = 'text-warning';
        } else if (health === 'GOOD') {
            score = 88;
            colorClass = 'text-info';
        }

        if (elHealth) {
            elHealth.textContent = health;
            elHealth.className = `hero-value font-outfit mb-0 ${colorClass}`;
        }
        if (elHealthScore) elHealthScore.textContent = `${score}%`;
        if (elHealthIcon) {
            elHealthIcon.className = `metric-icon-badge ${colorClass}`;
        }
        if (elMaintBadge) {
            elMaintBadge.textContent = `Status: ${s.maintenanceStatus || 'OK'}`;
            elMaintBadge.className = `badge ${score > 75 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`;
        }

        // Active Alerts Pill
        const elPillAlerts = document.getElementById('pillActiveAlerts');
        if (elPillAlerts) {
            elPillAlerts.textContent = s.activeAlerts || 0;
            elPillAlerts.className = (s.activeAlerts > 0) ? 'font-outfit text-danger' : 'font-outfit text-success';
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

        if (elDaily) elDaily.textContent = `${(Number(a.dailyEnergy || 0) / 1000).toFixed(2)} kWh`;
        if (elWeekly) elWeekly.textContent = `${(Number(a.weeklyEnergy || 0) / 1000).toFixed(2)} kWh`;
        if (elMonthly) elMonthly.textContent = `${(Number(a.monthlyEnergy || 0) / 1000).toFixed(2)} kWh`;
        if (elAvgEff) elAvgEff.textContent = `${Number(a.averageEfficiency || 0).toFixed(1)}%`;
        if (elUptime) elUptime.textContent = a.uptimeStatus || `${Number(a.systemUptime || 99.8).toFixed(1)}%`;
        if (elReadings && a.totalReadings) elReadings.textContent = a.totalReadings;
    }
};

window.Dashboard = Dashboard;

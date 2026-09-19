/**
 * SolarEye — Master Application Bootstrapper & Lifecycle Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
    SolarEyeApp.init();
});

const SolarEyeApp = {
    init() {
        console.log('☀️ SolarEye IoT Platform Initializing...');

        // 1. Initialize Theme
        this.initTheme();

        // 2. Initialize Real-Time Clock
        this.initClock();

        // 3. Initialize Sub-modules
        Auth.init();
        Dashboard.init();
        ChartsController.init();
        AlertsManager.init();
        Diagnostics.init();
        Simulator.init();

        // 4. Start 3-Second Live Polling Loop
        this.startPolling();

        console.log('✅ SolarEye Initialized Successfully.');
    },

    initClock() {
        const update = () => {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const dateStr = now.toLocaleDateString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });

            const clockEl = document.getElementById('liveClock');
            const dateEl = document.getElementById('liveDate');

            if (clockEl) clockEl.textContent = timeStr;
            if (dateEl) dateEl.textContent = dateStr;
        };

        update();
        setInterval(update, 1000);
    },

    initTheme() {
        const savedTheme = localStorage.getItem('solareye_theme') || 'dark';
        this.setTheme(savedTheme);

        document.getElementById('btnThemeToggle')?.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-bs-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            this.setTheme(next);
        });
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('solareye_theme', theme);

        const iconSun = document.querySelector('.theme-icon-sun');
        const iconMoon = document.querySelector('.theme-icon-moon');

        if (theme === 'light') {
            iconSun?.classList.remove('d-none');
            iconMoon?.classList.add('d-none');
        } else {
            iconSun?.classList.add('d-none');
            iconMoon?.classList.remove('d-none');
        }

        // Update charts styling for theme contrast
        if (window.ChartsController) {
            ChartsController.updateTheme();
        }
    },

    startPolling() {
        if (AppState.isPolling) return;
        AppState.isPolling = true;

        let cycle = 0;

        AppState.pollTimerId = setInterval(async () => {
            cycle++;

            // Every 3 seconds: Refresh live telemetry, dashboard cards, alerts & diagnostics
            await Promise.all([
                Dashboard.fetchDashboardData(),
                AlertsManager.fetchAlerts(),
                Diagnostics.fetchPredictions()
            ]);

            // Every 6 seconds: Refresh charts
            if (cycle % 2 === 0 && window.ChartsController) {
                ChartsController.loadChartData(AppState.chartTimeRangeHours);
            }

        }, CONFIG.POLL_INTERVAL_MS);
    },

    stopPolling() {
        if (AppState.pollTimerId) {
            clearInterval(AppState.pollTimerId);
            AppState.pollTimerId = null;
            AppState.isPolling = false;
        }
    }
};

window.SolarEyeApp = SolarEyeApp;

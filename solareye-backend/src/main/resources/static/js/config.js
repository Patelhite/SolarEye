/**
 * SolarEye — Global Configuration & Reactive State Store
 */

const CONFIG = {
    // API Base Endpoints
    API_BASE: '',
    ENDPOINTS: {
        SOLAR_LATEST: '/api/solar/latest',
        SOLAR_DASHBOARD: '/api/solar/dashboard',
        SOLAR_CHARTS: '/api/solar/charts',
        SOLAR_HISTORY: '/api/solar/history',
        SOLAR_DATA_INGEST: '/api/solar/data',
        ALERTS_ACTIVE: '/api/alerts/active',
        ALERTS_ALL: '/api/alerts',
        ALERT_RESOLVE: (id) => `/api/alerts/${id}/resolve`,
        PREDICTIONS_STATUS: '/api/predictions/status',
        PREDICTIONS_ALL: '/api/predictions',
        ANALYTICS_SUMMARY: '/api/analytics/summary',
        SIMULATION_STATUS: '/api/simulation/status',
        SIMULATION_TOGGLE: '/api/simulation/toggle',
        AUTH_LOGIN: '/api/auth/login',
        AUTH_LOGOUT: '/api/auth/logout',
        AUTH_ME: '/api/auth/me'
    },

    // Polling Intervals
    POLL_INTERVAL_MS: 3000,
    CHARTS_POLL_INTERVAL_MS: 6000,

    // Nominal Thresholds for Visual Health Indicators
    THRESHOLDS: {
        VOLTAGE_MIN: 12.0,
        VOLTAGE_MAX: 24.0,
        CURRENT_MAX: 5.5,
        TEMP_WARN: 45.0,
        TEMP_CRITICAL: 50.0,
        HUMIDITY_HIGH: 85.0,
        POWER_MIN: 2.0
    }
};

// Global Reactive Application State
const AppState = {
    user: null,
    theme: 'dark',
    chartTimeRangeHours: 1,
    latestTelemetry: null,
    dashboardSummary: null,
    activeAlerts: [],
    predictions: [],
    analytics: null,
    simulationActive: true,
    isPolling: false,
    pollTimerId: null
};

window.CONFIG = CONFIG;
window.AppState = AppState;

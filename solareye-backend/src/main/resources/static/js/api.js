/**
 * SolarEye — Centralized Backend API Client
 * Wraps all 9 Phase 1 Spring Boot REST Endpoints
 */

const Api = {
    /**
     * Generic HTTP request helper with error handling
     */
    async request(url, options = {}) {
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMsg = data && (data.message || data.error) 
                    ? (data.message || data.error) 
                    : `HTTP Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMsg);
            }

            return data;
        } catch (error) {
            console.warn(`[SolarEye API Error] ${options.method || 'GET'} ${url}:`, error.message);
            throw error;
        }
    },

    // 1. GET /api/solar/latest
    async getLatestSolarData() {
        return this.request(CONFIG.ENDPOINTS.SOLAR_LATEST);
    },

    // 2. GET /api/solar/dashboard
    async getDashboardSummary() {
        return this.request(CONFIG.ENDPOINTS.SOLAR_DASHBOARD);
    },

    // 3. GET /api/solar/charts?hours=N
    async getChartData(hours = 1) {
        return this.request(`${CONFIG.ENDPOINTS.SOLAR_CHARTS}?hours=${hours}`);
    },

    // 4. GET /api/alerts/active
    async getActiveAlerts() {
        return this.request(CONFIG.ENDPOINTS.ALERTS_ACTIVE);
    },

    // 5. PUT /api/alerts/{id}/resolve
    async resolveAlert(id) {
        return this.request(CONFIG.ENDPOINTS.ALERT_RESOLVE(id), {
            method: 'PUT'
        });
    },

    // 6. GET /api/predictions/status
    async getPredictionsStatus() {
        return this.request(CONFIG.ENDPOINTS.PREDICTIONS_STATUS);
    },

    // 7. GET /api/predictions
    async getPredictions() {
        return this.request(CONFIG.ENDPOINTS.PREDICTIONS_ALL);
    },

    // 8. GET /api/analytics/summary
    async getAnalyticsSummary() {
        return this.request(CONFIG.ENDPOINTS.ANALYTICS_SUMMARY);
    },

    // 9. GET /api/simulation/status
    async getSimulationStatus() {
        return this.request(CONFIG.ENDPOINTS.SIMULATION_STATUS);
    },

    // 10. POST /api/simulation/toggle
    async toggleSimulation() {
        return this.request(CONFIG.ENDPOINTS.SIMULATION_TOGGLE, {
            method: 'POST'
        });
    },

    // 11. POST /api/auth/login
    async login(email, password) {
        return this.request(CONFIG.ENDPOINTS.AUTH_LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    // 12. POST /api/solar/data (NodeMCU ESP8266 Ingest API)
    async ingestSensorData(payload) {
        return this.request(CONFIG.ENDPOINTS.SOLAR_DATA_INGEST, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
};

window.Api = Api;

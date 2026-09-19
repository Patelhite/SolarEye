/**
 * SolarEye — Chart.js Visualizations & Dynamic Telemetry Curves
 */

const ChartsController = {
    instances: {
        powerVoltage: null,
        tempEfficiency: null,
        energyHistory: null
    },

    init() {
        this.bindEvents();
        this.initPowerVoltageChart();
        this.initTempEfficiencyChart();
        this.initEnergyHistoryChart();
        this.loadChartData(AppState.chartTimeRangeHours);
    },

    bindEvents() {
        const timeTabs = document.querySelectorAll('#powerChartTimeRange .btn-chart-tab');
        timeTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                timeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const hours = parseInt(tab.getAttribute('data-hours'), 10) || 1;
                AppState.chartTimeRangeHours = hours;
                this.loadChartData(hours);
            });
        });
    },

    getThemeColors() {
        const isDark = document.documentElement.getAttribute('data-bs-theme') !== 'light';
        return {
            gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            textColor: isDark ? '#9CA3AF' : '#52525B',
            tooltipBg: isDark ? 'rgba(18, 18, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            tooltipText: isDark ? '#FFFFFF' : '#18181B'
        };
    },

    // 1. Power & Voltage Dynamic Dual Line Chart
    initPowerVoltageChart() {
        const ctx = document.getElementById('powerVoltageChart')?.getContext('2d');
        if (!ctx) return;

        const theme = this.getThemeColors();

        // Solar Gradient Fill
        const powerGradient = ctx.createLinearGradient(0, 0, 0, 300);
        powerGradient.addColorStop(0, 'rgba(249, 87, 22, 0.45)');
        powerGradient.addColorStop(1, 'rgba(249, 87, 22, 0.0)');

        const voltageGradient = ctx.createLinearGradient(0, 0, 0, 300);
        voltageGradient.addColorStop(0, 'rgba(0, 240, 255, 0.3)');
        voltageGradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');

        this.instances.powerVoltage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Solar Power (W)',
                        data: [],
                        borderColor: '#F95716',
                        backgroundColor: powerGradient,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.35,
                        pointRadius: 2,
                        pointHoverRadius: 6,
                        yAxisID: 'yPower'
                    },
                    {
                        label: 'Panel Voltage (V)',
                        data: [],
                        borderColor: '#00F0FF',
                        backgroundColor: voltageGradient,
                        borderWidth: 1.8,
                        borderDash: [4, 4],
                        fill: false,
                        tension: 0.35,
                        pointRadius: 1.5,
                        pointHoverRadius: 5,
                        yAxisID: 'yVoltage'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: theme.textColor,
                            font: { family: 'Outfit', size: 12, weight: '600' },
                            usePointStyle: true,
                            boxWidth: 8
                        }
                    },
                    tooltip: {
                        backgroundColor: theme.tooltipBg,
                        titleColor: theme.tooltipText,
                        bodyColor: theme.tooltipText,
                        borderColor: 'rgba(249, 87, 22, 0.3)',
                        borderWidth: 1,
                        padding: 10,
                        bodyFont: { family: 'Outfit' }
                    }
                },
                scales: {
                    x: {
                        grid: { color: theme.gridColor },
                        ticks: { color: theme.textColor, maxTicksLimit: 8, font: { family: 'Inter', size: 10 } }
                    },
                    yPower: {
                        type: 'linear',
                        position: 'left',
                        grid: { color: theme.gridColor },
                        ticks: { color: '#F95716', font: { family: 'Outfit', weight: '600' } },
                        title: { display: true, text: 'Power (W)', color: '#F95716' }
                    },
                    yVoltage: {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#00F0FF', font: { family: 'Outfit', weight: '600' } },
                        title: { display: true, text: 'Voltage (V)', color: '#00F0FF' }
                    }
                }
            }
        });
    },

    // 2. Temperature vs Efficiency Correlation
    initTempEfficiencyChart() {
        const ctx = document.getElementById('tempEfficiencyChart')?.getContext('2d');
        if (!ctx) return;

        const theme = this.getThemeColors();

        this.instances.tempEfficiency = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: [],
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 2,
                        yAxisID: 'yTemp'
                    },
                    {
                        label: 'Efficiency (%)',
                        data: [],
                        borderColor: '#10B981',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.3,
                        pointRadius: 2,
                        yAxisID: 'yEff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: theme.textColor,
                            font: { family: 'Outfit', size: 11, weight: '600' },
                            usePointStyle: true,
                            boxWidth: 8
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: theme.gridColor },
                        ticks: { color: theme.textColor, maxTicksLimit: 6, font: { size: 10 } }
                    },
                    yTemp: {
                        type: 'linear',
                        position: 'left',
                        grid: { color: theme.gridColor },
                        ticks: { color: '#EF4444' }
                    },
                    yEff: {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#10B981' }
                    }
                }
            }
        });
    },

    // 3. Historical Energy Bar Chart
    initEnergyHistoryChart() {
        const ctx = document.getElementById('energyHistoryChart')?.getContext('2d');
        if (!ctx) return;

        const theme = this.getThemeColors();

        this.instances.energyHistory = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Energy (Wh)',
                        data: [],
                        backgroundColor: 'rgba(245, 158, 11, 0.7)',
                        borderColor: '#F59E0B',
                        borderWidth: 1,
                        borderRadius: 6,
                        yAxisID: 'yEnergy'
                    },
                    {
                        label: 'Light Intensity (Lux)',
                        data: [],
                        type: 'line',
                        borderColor: '#FBBF24',
                        borderWidth: 1.5,
                        pointRadius: 1.5,
                        fill: false,
                        yAxisID: 'yLux'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: theme.textColor,
                            font: { family: 'Outfit', size: 11, weight: '600' },
                            usePointStyle: true,
                            boxWidth: 8
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: theme.gridColor },
                        ticks: { color: theme.textColor, maxTicksLimit: 12, font: { size: 10 } }
                    },
                    yEnergy: {
                        type: 'linear',
                        position: 'left',
                        grid: { color: theme.gridColor },
                        ticks: { color: '#F59E0B' }
                    },
                    yLux: {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#FBBF24' }
                    }
                }
            }
        });
    },

    // Load and update chart data from backend
    async loadChartData(hours = 1) {
        try {
            const res = await Api.getChartData(hours);
            if (res.success && res.data) {
                this.updateCharts(res.data);
            }
        } catch (e) {
            console.warn('[Charts Data Fetch Error]:', e);
        }
    },

    updateCharts(chartData) {
        const timestamps = chartData.timestamps || [];
        const powers = chartData.powers || [];
        const voltages = chartData.voltages || [];
        const temperatures = chartData.temperatures || [];
        const efficiencies = chartData.efficiencies || [];
        const energies = chartData.energies || [];
        const lightIntensities = chartData.lightIntensities || [];

        // Format short time labels (HH:mm)
        const formattedLabels = timestamps.map(t => {
            const parts = t.split(' ');
            return parts.length > 1 ? parts[1].substring(0, 5) : t;
        });

        // 1. Update Power / Voltage Chart
        if (this.instances.powerVoltage) {
            this.instances.powerVoltage.data.labels = formattedLabels;
            this.instances.powerVoltage.data.datasets[0].data = powers;
            this.instances.powerVoltage.data.datasets[1].data = voltages;
            this.instances.powerVoltage.update('none'); // Update without full redraw animation for smoothness
        }

        // 2. Update Temperature / Efficiency Chart
        if (this.instances.tempEfficiency) {
            this.instances.tempEfficiency.data.labels = formattedLabels;
            this.instances.tempEfficiency.data.datasets[0].data = temperatures;
            this.instances.tempEfficiency.data.datasets[1].data = efficiencies;
            this.instances.tempEfficiency.update('none');
        }

        // 3. Update Energy History Bar Chart
        if (this.instances.energyHistory) {
            this.instances.energyHistory.data.labels = formattedLabels;
            this.instances.energyHistory.data.datasets[0].data = energies;
            this.instances.energyHistory.data.datasets[1].data = lightIntensities;
            this.instances.energyHistory.update('none');
        }
    },

    updateTheme() {
        const theme = this.getThemeColors();
        Object.values(this.instances).forEach(chart => {
            if (!chart) return;
            if (chart.options.scales.x) chart.options.scales.x.grid.color = theme.gridColor;
            if (chart.options.scales.x) chart.options.scales.x.ticks.color = theme.textColor;
            if (chart.options.plugins.legend) chart.options.plugins.legend.labels.color = theme.textColor;
            chart.update();
        });
    }
};

window.ChartsController = ChartsController;

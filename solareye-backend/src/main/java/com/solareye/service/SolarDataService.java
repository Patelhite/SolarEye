package com.solareye.service;

import com.solareye.dto.*;

import java.util.List;

public interface SolarDataService {

    /**
     * Save incoming sensor data and trigger analysis.
     */
    SolarDataResponse saveData(SolarDataDTO dto);

    /**
     * Get the latest sensor reading.
     */
    SolarDataResponse getLatestData();

    /**
     * Get historical data for a given number of hours.
     */
    List<SolarDataResponse> getHistory(int hours);

    /**
     * Get chart-ready time-series data.
     */
    ChartDataResponse getChartData(int hours);

    /**
     * Get aggregated dashboard summary.
     */
    DashboardSummaryResponse getDashboardSummary();
}

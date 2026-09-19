package com.solareye.service;

import com.solareye.dto.PredictionResponse;

import java.util.List;

public interface PredictiveMaintenanceService {

    /**
     * Run predictive maintenance analysis on recent sensor data.
     * Checks for:
     * 1. Panel cleaning needed (high light + normal temp + decreasing power)
     * 2. Panel fault (rising temp + dropping power)
     * 3. Electrical inspection (voltage fluctuation)
     */
    void runAnalysis();

    /**
     * Get all maintenance predictions.
     */
    List<PredictionResponse> getPredictions();

    /**
     * Get recent predictions (last N hours).
     */
    List<PredictionResponse> getRecentPredictions(int hours);

    /**
     * Get the latest maintenance status summary.
     */
    String getMaintenanceStatus();
}

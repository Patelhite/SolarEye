package com.solareye.service;

import com.solareye.dto.AlertResponse;
import com.solareye.entity.SolarData;

import java.util.List;

public interface AlertService {

    /**
     * Analyze sensor data and generate alerts if thresholds are exceeded.
     */
    void analyzeAndGenerateAlerts(SolarData data);

    /**
     * Get all alerts, optionally filtered by status.
     */
    List<AlertResponse> getAlerts(String status);

    /**
     * Get recent alerts (last N hours).
     */
    List<AlertResponse> getRecentAlerts(int hours);

    /**
     * Resolve an alert by ID.
     */
    void resolveAlert(Long alertId);

    /**
     * Get count of active alerts.
     */
    long getActiveAlertCount();

    /**
     * Get count of alerts by severity.
     */
    long getAlertCountBySeverity(String severity);
}

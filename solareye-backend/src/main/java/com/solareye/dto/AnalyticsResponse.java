package com.solareye.dto;

import lombok.*;

/**
 * Analytics response for daily/weekly/monthly energy and performance stats.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private Double dailyEnergy;
    private Double weeklyEnergy;
    private Double monthlyEnergy;
    private Double averageEfficiency;
    private Double averagePower;
    private Double averageVoltage;
    private Double averageTemperature;
    private Double peakPower;
    private Long totalReadings;
    private Double systemUptime;          // Percentage
    private String uptimeStatus;           // e.g. "99.5% — Excellent"
    private Long maintenanceRecommendations;
}

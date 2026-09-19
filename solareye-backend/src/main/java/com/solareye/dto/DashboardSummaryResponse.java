package com.solareye.dto;

import lombok.*;

/**
 * Aggregated dashboard summary for the main overview page.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    // Latest readings
    private Double currentVoltage;
    private Double currentCurrent;
    private Double currentPower;
    private Double currentTemperature;
    private Double currentHumidity;
    private Double currentLightIntensity;
    private String systemHealth;

    // Today's energy
    private Double todayEnergy;

    // Predictive maintenance status
    private String maintenanceStatus;
    private String maintenanceMessage;

    // Alert counts
    private long activeAlerts;
    private long redAlerts;
    private long yellowAlerts;

    // System status
    private boolean sensorOnline;
    private String lastUpdated;
}

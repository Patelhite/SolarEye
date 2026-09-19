package com.solareye.dto;

import lombok.*;

import java.util.List;

/**
 * Time-series data payload for Chart.js integration.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChartDataResponse {

    private List<String> labels;          // Timestamps formatted for display
    private List<Double> voltage;
    private List<Double> current;
    private List<Double> power;
    private List<Double> temperature;
    private List<Double> humidity;
    private List<Double> lightIntensity;
    private List<Double> energy;
}

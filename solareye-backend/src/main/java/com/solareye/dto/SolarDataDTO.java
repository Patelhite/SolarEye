package com.solareye.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Incoming sensor data payload from NodeMCU ESP8266 or simulation engine.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolarDataDTO {

    @NotNull(message = "Voltage is required")
    @Min(value = 0, message = "Voltage must be non-negative")
    private Double voltage;

    @NotNull(message = "Current is required")
    @Min(value = 0, message = "Current must be non-negative")
    private Double current;

    private Double power;         // Calculated if not provided: voltage × current

    private Double energy;        // Accumulated energy

    @NotNull(message = "Temperature is required")
    private Double temperature;

    @NotNull(message = "Humidity is required")
    private Double humidity;

    @NotNull(message = "Light intensity is required")
    @Min(value = 0, message = "Light intensity must be non-negative")
    private Double lightIntensity;
}

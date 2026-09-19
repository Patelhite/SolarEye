package com.solareye.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

/**
 * API response for solar data readings.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolarDataResponse {

    private Long id;
    private Double voltage;
    private Double current;
    private Double power;
    private Double energy;
    private Double temperature;
    private Double humidity;
    private Double lightIntensity;
    private String systemHealth;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
}

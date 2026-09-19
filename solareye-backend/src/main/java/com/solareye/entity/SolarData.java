package com.solareye.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solar_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolarData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private Double voltage = 0.0;

    @Column(name = "current_val", nullable = false)
    @Builder.Default
    private Double current = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double power = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double energy = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double temperature = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double humidity = 0.0;

    @Column(name = "light_intensity", nullable = false)
    @Builder.Default
    private Double lightIntensity = 0.0;

    @Column(name = "system_health", nullable = false, length = 20)
    @Builder.Default
    private String systemHealth = "GOOD";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

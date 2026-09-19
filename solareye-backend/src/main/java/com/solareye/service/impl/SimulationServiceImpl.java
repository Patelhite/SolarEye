package com.solareye.service.impl;

import com.solareye.dto.SolarDataDTO;
import com.solareye.service.SimulationService;
import com.solareye.service.SolarDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Realistic solar data simulator with time-of-day modelling.
 *
 * Generates data that follows natural solar patterns:
 * - Voltage/Current/Power peak around noon
 * - Temperature rises during the day, cools at night
 * - Humidity inversely correlates with temperature
 * - Light intensity follows a solar bell curve
 *
 * Occasionally injects anomalies to test the alert and predictive maintenance systems.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SimulationServiceImpl implements SimulationService {

    private final SolarDataService solarDataService;
    private final Random random = new Random();
    private final AtomicBoolean enabled = new AtomicBoolean();

    @Value("${solareye.simulation.enabled:true}")
    private boolean configEnabled;

    // Anomaly injection counter
    private int tickCount = 0;

    @Override
    @Scheduled(fixedDelayString = "${solareye.simulation.interval-ms:5000}")
    public void generateSimulatedData() {
        // Initialize from config on first call
        if (tickCount == 0) {
            enabled.set(configEnabled);
        }

        if (!enabled.get()) {
            return;
        }

        tickCount++;

        // Get current time-of-day factor (0.0 = midnight, 1.0 = noon)
        double timeOfDayFactor = calculateTimeOfDayFactor();
        boolean isDaytime = timeOfDayFactor > 0.1;

        // ── Generate realistic sensor values ────────────────────

        // Light Intensity: 0-1000 lux, peaks at noon
        double lightIntensity = isDaytime
                ? 100 + (900 * timeOfDayFactor) + noise(50)
                : noise(20);
        lightIntensity = clamp(lightIntensity, 0, 1000);

        // Voltage: 5-18V, correlated with light
        double voltage = isDaytime
                ? 5.0 + (13.0 * timeOfDayFactor) + noise(0.5)
                : 0.5 + noise(0.3);
        voltage = clamp(voltage, 0, 20);

        // Current: 0.2-3A, correlated with light
        double current = isDaytime
                ? 0.2 + (2.8 * timeOfDayFactor) + noise(0.15)
                : 0.01 + noise(0.02);
        current = clamp(current, 0, 3.5);

        // Temperature: 25-55°C, rises during the day
        double baseTemp = 25.0 + (20.0 * timeOfDayFactor);
        double temperature = baseTemp + noise(2.0);
        temperature = clamp(temperature, 20, 60);

        // Humidity: 30-80%, inversely proportional to temperature
        double humidity = 80.0 - (50.0 * timeOfDayFactor) + noise(5.0);
        humidity = clamp(humidity, 25, 85);

        // ── Inject anomalies periodically ───────────────────────

        boolean anomaly = false;
        if (tickCount % 60 == 0 && isDaytime) {
            // Every ~5 minutes: simulate power degradation (dirty panel)
            current *= 0.3;
            anomaly = true;
            log.info("🔬 Simulation: Injecting LOW POWER anomaly (dirty panel scenario)");
        } else if (tickCount % 90 == 0 && isDaytime) {
            // Temperature spike + power drop (panel fault)
            temperature = 52.0 + noise(3.0);
            current *= 0.5;
            anomaly = true;
            log.info("🔬 Simulation: Injecting HIGH TEMP + LOW POWER anomaly (fault scenario)");
        } else if (tickCount % 120 == 0 && isDaytime) {
            // Voltage fluctuation (electrical issue)
            voltage = voltage + (random.nextBoolean() ? 5.0 : -5.0);
            voltage = clamp(voltage, 0, 22);
            anomaly = true;
            log.info("🔬 Simulation: Injecting VOLTAGE FLUCTUATION anomaly");
        }

        // ── Build and save ──────────────────────────────────────

        SolarDataDTO dto = SolarDataDTO.builder()
                .voltage(round(voltage))
                .current(round(current))
                .temperature(round(temperature))
                .humidity(round(humidity))
                .lightIntensity(round(lightIntensity))
                .build();

        solarDataService.saveData(dto);

        if (anomaly) {
            log.info("📊 Simulation [ANOMALY]: V={}V, I={}A, T={}°C, H={}%, L={}lux",
                    voltage, current, temperature, humidity, lightIntensity);
        }
    }

    @Override
    public void setEnabled(boolean enabled) {
        this.enabled.set(enabled);
        log.info("Simulation engine {}", enabled ? "ENABLED" : "DISABLED");
    }

    @Override
    public boolean isEnabled() {
        return enabled.get();
    }

    // ── Helpers ──────────────────────────────────────────────────

    /**
     * Calculate a 0.0-1.0 factor based on time of day.
     * Uses a sine curve peaking at solar noon (12:00).
     * Returns 0.0 for nighttime hours (before 6 AM and after 6 PM).
     */
    private double calculateTimeOfDayFactor() {
        LocalTime now = LocalTime.now();
        int hour = now.getHour();
        int minute = now.getMinute();
        double hourDecimal = hour + minute / 60.0;

        // Solar hours: 6 AM to 6 PM
        if (hourDecimal < 6.0 || hourDecimal > 18.0) {
            return 0.0;
        }

        // Map 6-18 to 0-π for a sine curve
        double normalized = (hourDecimal - 6.0) / 12.0; // 0.0 to 1.0
        return Math.sin(normalized * Math.PI);
    }

    /**
     * Generate Gaussian noise with given standard deviation.
     */
    private double noise(double stddev) {
        return random.nextGaussian() * stddev;
    }

    /**
     * Clamp a value between min and max.
     */
    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Round to 2 decimal places.
     */
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

package com.solareye.service.impl;

import com.solareye.dto.AnalyticsResponse;
import com.solareye.repository.MaintenancePredictionRepository;
import com.solareye.repository.SolarDataRepository;
import com.solareye.service.AnalyticsService;
import com.solareye.utils.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final SolarDataRepository solarDataRepository;
    private final MaintenancePredictionRepository predictionRepository;

    @Override
    public AnalyticsResponse getAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = DateUtils.startOfToday();
        LocalDateTime endOfToday = DateUtils.endOfToday();
        LocalDateTime startOfWeek = DateUtils.startOfWeek();
        LocalDateTime startOfMonth = DateUtils.startOfMonth();

        // Energy aggregations
        Double dailyEnergy = solarDataRepository.sumEnergyBetween(startOfToday, endOfToday);
        Double weeklyEnergy = solarDataRepository.sumEnergyBetween(startOfWeek, now);
        Double monthlyEnergy = solarDataRepository.sumEnergyBetween(startOfMonth, now);

        // Performance metrics
        Double avgPower = solarDataRepository.avgPowerBetween(startOfToday, endOfToday);
        Double avgVoltage = solarDataRepository.avgVoltageBetween(startOfToday, endOfToday);
        Double avgTemperature = solarDataRepository.avgTemperatureBetween(startOfToday, endOfToday);

        // Total readings today
        long totalReadings = solarDataRepository.countByCreatedAtBetween(startOfToday, endOfToday);

        // Calculate efficiency (simplified: based on how consistently power was generated)
        double averageEfficiency = calculateEfficiency(avgPower, totalReadings);

        // Calculate system uptime (percentage of expected readings that exist)
        double systemUptime = calculateUptime(totalReadings, startOfToday, now);
        String uptimeStatus = formatUptimeStatus(systemUptime);

        // Peak power (approximate from average — in production you'd query MAX)
        double peakPower = avgPower != null ? avgPower * 1.4 : 0.0; // Rough estimate

        // Maintenance recommendations count
        long maintenanceCount = predictionRepository
                .findByCreatedAtAfterOrderByCreatedAtDesc(DateUtils.hoursAgo(24))
                .size();

        return AnalyticsResponse.builder()
                .dailyEnergy(round(dailyEnergy))
                .weeklyEnergy(round(weeklyEnergy))
                .monthlyEnergy(round(monthlyEnergy))
                .averageEfficiency(round(averageEfficiency))
                .averagePower(round(avgPower))
                .averageVoltage(round(avgVoltage))
                .averageTemperature(round(avgTemperature))
                .peakPower(round(peakPower))
                .totalReadings(totalReadings)
                .systemUptime(round(systemUptime))
                .uptimeStatus(uptimeStatus)
                .maintenanceRecommendations(maintenanceCount)
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────

    private double calculateEfficiency(Double avgPower, long totalReadings) {
        if (avgPower == null || avgPower <= 0 || totalReadings == 0) {
            return 0.0;
        }
        // Simplified efficiency: ratio of actual avg power to max expected (54W = 18V × 3A)
        double maxPower = 54.0;
        return Math.min((avgPower / maxPower) * 100.0, 100.0);
    }

    private double calculateUptime(long actualReadings, LocalDateTime start, LocalDateTime now) {
        // Expected readings = seconds elapsed / 5 (one reading every 5 seconds)
        long secondsElapsed = java.time.Duration.between(start, now).getSeconds();
        if (secondsElapsed <= 0) return 100.0;
        long expectedReadings = secondsElapsed / 5;
        if (expectedReadings <= 0) return 100.0;
        return Math.min(((double) actualReadings / expectedReadings) * 100.0, 100.0);
    }

    private String formatUptimeStatus(double uptime) {
        if (uptime >= 99.0) return String.format("%.1f%% — Excellent", uptime);
        if (uptime >= 95.0) return String.format("%.1f%% — Good", uptime);
        if (uptime >= 90.0) return String.format("%.1f%% — Fair", uptime);
        return String.format("%.1f%% — Poor", uptime);
    }

    private double round(Double value) {
        if (value == null) return 0.0;
        return Math.round(value * 100.0) / 100.0;
    }
}

package com.solareye.service.impl;

import com.solareye.dto.*;
import com.solareye.entity.SolarData;
import com.solareye.repository.AlertRepository;
import com.solareye.repository.MaintenancePredictionRepository;
import com.solareye.repository.SolarDataRepository;
import com.solareye.service.AlertService;
import com.solareye.service.PredictiveMaintenanceService;
import com.solareye.service.SolarDataService;
import com.solareye.utils.DateUtils;
import com.solareye.utils.SolarCalculations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SolarDataServiceImpl implements SolarDataService {

    private final SolarDataRepository solarDataRepository;
    private final AlertRepository alertRepository;
    private final MaintenancePredictionRepository predictionRepository;
    private final AlertService alertService;
    private final PredictiveMaintenanceService predictiveMaintenanceService;

    @Override
    @Transactional
    public SolarDataResponse saveData(SolarDataDTO dto) {
        // Calculate power if not provided
        double power = (dto.getPower() != null && dto.getPower() > 0)
                ? dto.getPower()
                : SolarCalculations.calculatePower(dto.getVoltage(), dto.getCurrent());

        // Calculate energy increment (assuming 5-second interval)
        double energy = (dto.getEnergy() != null && dto.getEnergy() > 0)
                ? dto.getEnergy()
                : SolarCalculations.calculateEnergy(power, 5);

        // Determine system health
        String systemHealth = SolarCalculations.determineSystemHealth(
                dto.getVoltage(), power, dto.getTemperature(), dto.getLightIntensity());

        SolarData solarData = SolarData.builder()
                .voltage(dto.getVoltage())
                .current(dto.getCurrent())
                .power(power)
                .energy(energy)
                .temperature(dto.getTemperature())
                .humidity(dto.getHumidity())
                .lightIntensity(dto.getLightIntensity())
                .systemHealth(systemHealth)
                .build();

        SolarData saved = solarDataRepository.save(solarData);
        log.info("Saved solar data: id={}, V={}, I={}, P={}, T={}, H={}, L={}",
                saved.getId(), saved.getVoltage(), saved.getCurrent(), saved.getPower(),
                saved.getTemperature(), saved.getHumidity(), saved.getLightIntensity());

        // Trigger alert analysis
        alertService.analyzeAndGenerateAlerts(saved);

        // Trigger predictive maintenance analysis
        predictiveMaintenanceService.runAnalysis();

        return toResponse(saved);
    }

    @Override
    public SolarDataResponse getLatestData() {
        return solarDataRepository.findTopByOrderByCreatedAtDesc()
                .map(this::toResponse)
                .orElse(SolarDataResponse.builder()
                        .voltage(0.0)
                        .current(0.0)
                        .power(0.0)
                        .energy(0.0)
                        .temperature(0.0)
                        .humidity(0.0)
                        .lightIntensity(0.0)
                        .systemHealth("OFFLINE")
                        .build());
    }

    @Override
    public List<SolarDataResponse> getHistory(int hours) {
        LocalDateTime start = DateUtils.hoursAgo(hours);
        LocalDateTime end = LocalDateTime.now();
        return solarDataRepository.findByCreatedAtBetweenOrderByCreatedAtAsc(start, end)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ChartDataResponse getChartData(int hours) {
        LocalDateTime start = DateUtils.hoursAgo(hours);
        LocalDateTime end = LocalDateTime.now();
        List<SolarData> dataList = solarDataRepository
                .findByCreatedAtBetweenOrderByCreatedAtAsc(start, end);

        List<String> labels = new ArrayList<>();
        List<Double> voltages = new ArrayList<>();
        List<Double> currents = new ArrayList<>();
        List<Double> powers = new ArrayList<>();
        List<Double> temperatures = new ArrayList<>();
        List<Double> humidities = new ArrayList<>();
        List<Double> lightIntensities = new ArrayList<>();
        List<Double> energies = new ArrayList<>();

        for (SolarData data : dataList) {
            labels.add(DateUtils.formatForChart(data.getCreatedAt()));
            voltages.add(data.getVoltage());
            currents.add(data.getCurrent());
            powers.add(data.getPower());
            temperatures.add(data.getTemperature());
            humidities.add(data.getHumidity());
            lightIntensities.add(data.getLightIntensity());
            energies.add(data.getEnergy());
        }

        return ChartDataResponse.builder()
                .labels(labels)
                .voltage(voltages)
                .current(currents)
                .power(powers)
                .temperature(temperatures)
                .humidity(humidities)
                .lightIntensity(lightIntensities)
                .energy(energies)
                .build();
    }

    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        SolarDataResponse latest = getLatestData();
        Double todayEnergy = solarDataRepository.sumEnergyBetween(
                DateUtils.startOfToday(), DateUtils.endOfToday());

        // Check if sensor is online (data received in last 60 seconds)
        boolean sensorOnline = solarDataRepository.findTopByOrderByCreatedAtDesc()
                .map(d -> d.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(60)))
                .orElse(false);

        String maintenanceStatus = predictiveMaintenanceService.getMaintenanceStatus();
        long activeAlerts = alertService.getActiveAlertCount();
        long redAlerts = alertService.getAlertCountBySeverity("RED");
        long yellowAlerts = alertService.getAlertCountBySeverity("YELLOW");

        return DashboardSummaryResponse.builder()
                .currentVoltage(latest.getVoltage())
                .currentCurrent(latest.getCurrent())
                .currentPower(latest.getPower())
                .currentTemperature(latest.getTemperature())
                .currentHumidity(latest.getHumidity())
                .currentLightIntensity(latest.getLightIntensity())
                .systemHealth(latest.getSystemHealth())
                .todayEnergy(Math.round(todayEnergy * 100.0) / 100.0)
                .maintenanceStatus(maintenanceStatus)
                .maintenanceMessage(maintenanceStatus.equals("OK")
                        ? "All systems nominal"
                        : "Maintenance attention needed")
                .activeAlerts(activeAlerts)
                .redAlerts(redAlerts)
                .yellowAlerts(yellowAlerts)
                .sensorOnline(sensorOnline)
                .lastUpdated(latest.getCreatedAt() != null
                        ? DateUtils.formatFull(latest.getCreatedAt())
                        : "N/A")
                .build();
    }

    // ── Mapping ──────────────────────────────────────────────────

    private SolarDataResponse toResponse(SolarData data) {
        return SolarDataResponse.builder()
                .id(data.getId())
                .voltage(data.getVoltage())
                .current(data.getCurrent())
                .power(data.getPower())
                .energy(data.getEnergy())
                .temperature(data.getTemperature())
                .humidity(data.getHumidity())
                .lightIntensity(data.getLightIntensity())
                .systemHealth(data.getSystemHealth())
                .createdAt(data.getCreatedAt())
                .build();
    }
}

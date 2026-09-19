package com.solareye.service.impl;

import com.solareye.dto.PredictionResponse;
import com.solareye.entity.MaintenancePrediction;
import com.solareye.entity.SolarData;
import com.solareye.repository.MaintenancePredictionRepository;
import com.solareye.repository.SolarDataRepository;
import com.solareye.service.PredictiveMaintenanceService;
import com.solareye.utils.DateUtils;
import com.solareye.utils.SolarCalculations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictiveMaintenanceServiceImpl implements PredictiveMaintenanceService {

    private final SolarDataRepository solarDataRepository;
    private final MaintenancePredictionRepository predictionRepository;

    @Value("${solareye.predictive.window-size:20}")
    private int windowSize;

    @Value("${solareye.predictive.voltage-fluctuation-threshold:3.0}")
    private double voltageFluctuationThreshold;

    @Value("${solareye.predictive.power-drop-percentage:20.0}")
    private double powerDropPercentage;

    // Cooldown period: don't regenerate same prediction within 30 minutes
    private static final int PREDICTION_COOLDOWN_MINUTES = 30;

    @Override
    @Transactional
    public void runAnalysis() {
        List<SolarData> recentData = solarDataRepository.findLatestReadings(windowSize);

        if (recentData.size() < 5) {
            // Not enough data for analysis
            return;
        }

        // Data is ordered DESC (newest first), reverse for chronological order
        java.util.Collections.reverse(recentData);
        List<SolarData> chronological = recentData;
        LocalDateTime cooldownTime = LocalDateTime.now().minusMinutes(PREDICTION_COOLDOWN_MINUTES);

        checkPanelCleaning(chronological, cooldownTime);
        checkPanelFault(chronological, cooldownTime);
        checkElectricalInspection(chronological, cooldownTime);
    }

    /**
     * RULE 1: Panel Cleaning Required
     * IF: Light Intensity is High AND Temperature is Normal AND Power Output continuously decreases
     * THEN: "Possible Solar Panel Cleaning Required"
     */
    private void checkPanelCleaning(List<SolarData> data, LocalDateTime cooldownTime) {
        double[] powers = data.stream().mapToDouble(SolarData::getPower).toArray();
        double[] lights = data.stream().mapToDouble(SolarData::getLightIntensity).toArray();
        double[] temps = data.stream().mapToDouble(SolarData::getTemperature).toArray();

        // Check conditions
        double avgLight = average(lights);
        double avgTemp = average(temps);
        double powerSlope = SolarCalculations.calculateTrendSlope(powers);

        boolean highLight = avgLight > 600;
        boolean normalTemp = avgTemp < 45.0;
        boolean decreasingPower = powerSlope < -0.05; // Negative slope = decreasing

        if (highLight && normalTemp && decreasingPower) {
            // Calculate confidence based on how strong the trend is
            double confidence = Math.min(Math.abs(powerSlope) * 20, 95.0);
            confidence = Math.round(confidence * 10.0) / 10.0;

            createPredictionIfNew(
                    "PANEL_CLEANING",
                    confidence,
                    "🧹 Possible Solar Panel Cleaning Required — Power output is declining "
                            + String.format("(trend: %.3f W/reading) ", powerSlope)
                            + "despite high light intensity "
                            + String.format("(avg: %.0f lux) ", avgLight)
                            + "and normal temperature "
                            + String.format("(avg: %.1f°C). ", avgTemp)
                            + "Dust, debris, or bird droppings may be blocking sunlight.",
                    cooldownTime
            );
        }
    }

    /**
     * RULE 2: Panel Fault Detected
     * IF: Temperature continuously rises AND Power drops
     * THEN: "Possible Solar Panel Fault Detected"
     */
    private void checkPanelFault(List<SolarData> data, LocalDateTime cooldownTime) {
        double[] temps = data.stream().mapToDouble(SolarData::getTemperature).toArray();
        double[] powers = data.stream().mapToDouble(SolarData::getPower).toArray();

        double tempSlope = SolarCalculations.calculateTrendSlope(temps);
        double powerSlope = SolarCalculations.calculateTrendSlope(powers);

        boolean risingTemp = tempSlope > 0.1;
        boolean droppingPower = powerSlope < -0.05;

        if (risingTemp && droppingPower) {
            double confidence = Math.min((Math.abs(powerSlope) + tempSlope) * 15, 95.0);
            confidence = Math.round(confidence * 10.0) / 10.0;

            createPredictionIfNew(
                    "PANEL_FAULT",
                    confidence,
                    "🔥 Possible Solar Panel Fault Detected — Temperature is rising "
                            + String.format("(trend: +%.3f °C/reading) ", tempSlope)
                            + "while power output is dropping "
                            + String.format("(trend: %.3f W/reading). ", powerSlope)
                            + "This may indicate a hot spot, micro-crack, or cell degradation. "
                            + "Professional inspection recommended.",
                    cooldownTime
            );
        }
    }

    /**
     * RULE 3: Electrical Inspection Recommended
     * IF: Voltage fluctuates abnormally
     * THEN: "Electrical Inspection Recommended"
     */
    private void checkElectricalInspection(List<SolarData> data, LocalDateTime cooldownTime) {
        double[] voltages = data.stream().mapToDouble(SolarData::getVoltage).toArray();
        double stdDev = SolarCalculations.calculateStdDev(voltages);

        if (stdDev > voltageFluctuationThreshold) {
            double confidence = Math.min(stdDev / voltageFluctuationThreshold * 30, 95.0);
            confidence = Math.round(confidence * 10.0) / 10.0;

            createPredictionIfNew(
                    "ELECTRICAL_INSPECTION",
                    confidence,
                    "⚡ Electrical Inspection Recommended — Voltage readings are highly unstable "
                            + String.format("(σ = %.2fV, threshold = %.1fV). ", stdDev, voltageFluctuationThreshold)
                            + "This may indicate loose wiring, connector corrosion, or inverter issues. "
                            + "Inspect all electrical connections and wiring.",
                    cooldownTime
            );
        }
    }

    @Override
    public List<PredictionResponse> getPredictions() {
        return predictionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PredictionResponse> getRecentPredictions(int hours) {
        LocalDateTime after = DateUtils.hoursAgo(hours);
        return predictionRepository.findByCreatedAtAfterOrderByCreatedAtDesc(after)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public String getMaintenanceStatus() {
        // Check for any recent predictions (last 24 hours)
        LocalDateTime dayAgo = DateUtils.hoursAgo(24);
        List<MaintenancePrediction> recent = predictionRepository
                .findByCreatedAtAfterOrderByCreatedAtDesc(dayAgo);

        if (recent.isEmpty()) {
            return "OK";
        }

        // Return the most severe prediction type
        for (MaintenancePrediction p : recent) {
            if ("PANEL_FAULT".equals(p.getPredictionType())) return "CRITICAL";
            if ("ELECTRICAL_INSPECTION".equals(p.getPredictionType())) return "WARNING";
        }
        return "ATTENTION";
    }

    // ── Helpers ──────────────────────────────────────────────────

    private void createPredictionIfNew(String type, double confidence, String recommendation,
                                        LocalDateTime cooldownTime) {
        if (predictionRepository.existsByPredictionTypeAndCreatedAtAfter(type, cooldownTime)) {
            return; // Similar prediction exists within cooldown
        }

        MaintenancePrediction prediction = MaintenancePrediction.builder()
                .predictionType(type)
                .confidence(confidence)
                .recommendation(recommendation)
                .build();
        predictionRepository.save(prediction);
        log.warn("Maintenance prediction: [{}] confidence={}% — {}", type, confidence, recommendation);
    }

    private double average(double[] values) {
        if (values.length == 0) return 0;
        double sum = 0;
        for (double v : values) sum += v;
        return sum / values.length;
    }

    private PredictionResponse toResponse(MaintenancePrediction prediction) {
        return PredictionResponse.builder()
                .id(prediction.getId())
                .predictionType(prediction.getPredictionType())
                .confidence(prediction.getConfidence())
                .recommendation(prediction.getRecommendation())
                .createdAt(prediction.getCreatedAt())
                .build();
    }
}

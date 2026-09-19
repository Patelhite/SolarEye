package com.solareye.service.impl;

import com.solareye.dto.AlertResponse;
import com.solareye.entity.Alert;
import com.solareye.entity.SolarData;
import com.solareye.repository.AlertRepository;
import com.solareye.service.AlertService;
import com.solareye.utils.DateUtils;
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
public class AlertServiceImpl implements AlertService {

    private final AlertRepository alertRepository;

    @Value("${solareye.alerts.high-temp-red:50.0}")
    private double highTempRed;

    @Value("${solareye.alerts.high-temp-yellow:45.0}")
    private double highTempYellow;

    @Value("${solareye.alerts.low-power-threshold:2.0}")
    private double lowPowerThreshold;

    @Value("${solareye.alerts.low-power-light-min:500}")
    private int lowPowerLightMin;

    // Cooldown period to prevent duplicate alerts (5 minutes)
    private static final int ALERT_COOLDOWN_MINUTES = 5;

    @Override
    @Transactional
    public void analyzeAndGenerateAlerts(SolarData data) {
        LocalDateTime cooldownTime = LocalDateTime.now().minusMinutes(ALERT_COOLDOWN_MINUTES);

        // ── HIGH TEMPERATURE ────────────────────────────────────
        if (data.getTemperature() >= highTempRed) {
            createAlertIfNew("HIGH_TEMPERATURE", "RED",
                    String.format("🔴 Critical: Temperature reached %.1f°C — exceeds safe operating threshold (%.0f°C). "
                            + "Immediate inspection recommended.", data.getTemperature(), highTempRed),
                    cooldownTime);
        } else if (data.getTemperature() >= highTempYellow) {
            createAlertIfNew("HIGH_TEMPERATURE", "YELLOW",
                    String.format("🟡 Warning: Temperature at %.1f°C — approaching critical threshold (%.0f°C). "
                            + "Monitor closely.", data.getTemperature(), highTempRed),
                    cooldownTime);
        }

        // ── LOW SOLAR OUTPUT ────────────────────────────────────
        if (data.getLightIntensity() > lowPowerLightMin && data.getPower() < lowPowerThreshold) {
            String severity = data.getPower() < 1.0 ? "RED" : "YELLOW";
            createAlertIfNew("LOW_SOLAR_OUTPUT", severity,
                    String.format("⚡ Low solar output detected: %.2fW power with %.0f lux light intensity. "
                                    + "Panel may be obstructed or damaged.",
                            data.getPower(), data.getLightIntensity()),
                    cooldownTime);
        }

        // ── ABNORMAL PERFORMANCE ────────────────────────────────
        if (data.getVoltage() > 0 && data.getLightIntensity() > 300) {
            double expectedMinPower = data.getVoltage() * 0.1; // Conservative minimum
            if (data.getPower() < expectedMinPower) {
                createAlertIfNew("ABNORMAL_PERFORMANCE", "YELLOW",
                        String.format("⚠️ Abnormal performance: Power output (%.2fW) is below expected minimum "
                                        + "(%.2fW) given current voltage (%.1fV).",
                                data.getPower(), expectedMinPower, data.getVoltage()),
                        cooldownTime);
            }
        }

        // ── SYSTEM HEALTH CRITICAL ──────────────────────────────
        if ("CRITICAL".equals(data.getSystemHealth())) {
            createAlertIfNew("SYSTEM_CRITICAL", "RED",
                    "🚨 System health is CRITICAL. Multiple parameters outside safe operating range. "
                            + "Immediate investigation required.",
                    cooldownTime);
        }
    }

    @Override
    public List<AlertResponse> getAlerts(String status) {
        List<Alert> alerts;
        if (status != null && !status.isEmpty()) {
            alerts = alertRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            alerts = alertRepository.findAllByOrderByCreatedAtDesc();
        }
        return alerts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<AlertResponse> getRecentAlerts(int hours) {
        LocalDateTime after = DateUtils.hoursAgo(hours);
        return alertRepository.findByCreatedAtAfterOrderByCreatedAtDesc(after)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void resolveAlert(Long alertId) {
        alertRepository.findById(alertId).ifPresent(alert -> {
            alert.setStatus("RESOLVED");
            alertRepository.save(alert);
            log.info("Resolved alert: id={}, type={}", alertId, alert.getAlertType());
        });
    }

    @Override
    public long getActiveAlertCount() {
        return alertRepository.countByStatus("ACTIVE");
    }

    @Override
    public long getAlertCountBySeverity(String severity) {
        return alertRepository.countBySeverity(severity);
    }

    // ── Helpers ──────────────────────────────────────────────────

    private void createAlertIfNew(String alertType, String severity, String message,
                                   LocalDateTime cooldownTime) {
        // Skip if a similar alert was already created recently
        if (alertRepository.existsByAlertTypeAndStatusAndCreatedAtAfter(
                alertType, "ACTIVE", cooldownTime)) {
            return;
        }

        Alert alert = Alert.builder()
                .alertType(alertType)
                .severity(severity)
                .message(message)
                .status("ACTIVE")
                .build();
        alertRepository.save(alert);
        log.warn("Alert generated: [{}] {} — {}", severity, alertType, message);
    }

    private AlertResponse toResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .message(alert.getMessage())
                .status(alert.getStatus())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}

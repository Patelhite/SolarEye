package com.solareye.controller;

import com.solareye.dto.AlertResponse;
import com.solareye.dto.ApiResponse;
import com.solareye.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "System alert management and monitoring")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "Get all alerts",
            description = "Returns all alerts, optionally filtered by status (ACTIVE/RESOLVED).")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getAlerts(
            @Parameter(description = "Filter by status: ACTIVE or RESOLVED")
            @RequestParam(required = false) String status) {
        List<AlertResponse> alerts = alertService.getAlerts(status);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active alerts",
            description = "Returns all currently active (unresolved) alerts.")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getActiveAlerts() {
        List<AlertResponse> alerts = alertService.getAlerts("ACTIVE");
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent alerts",
            description = "Returns alerts from the last N hours.")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getRecentAlerts(
            @Parameter(description = "Number of hours to look back (default: 24)")
            @RequestParam(defaultValue = "24") int hours) {
        List<AlertResponse> alerts = alertService.getRecentAlerts(hours);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @PutMapping("/{id}/resolve")
    @Operation(summary = "Resolve an alert",
            description = "Marks an alert as resolved by its ID.")
    public ResponseEntity<ApiResponse<String>> resolveAlert(
            @PathVariable Long id) {
        alertService.resolveAlert(id);
        return ResponseEntity.ok(ApiResponse.success("Alert resolved", "Alert #" + id + " resolved"));
    }
}

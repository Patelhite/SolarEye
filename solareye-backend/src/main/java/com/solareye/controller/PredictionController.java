package com.solareye.controller;

import com.solareye.dto.ApiResponse;
import com.solareye.dto.PredictionResponse;
import com.solareye.service.PredictiveMaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@Tag(name = "Predictive Maintenance", description = "AI-driven predictive maintenance recommendations")
public class PredictionController {

    private final PredictiveMaintenanceService predictiveMaintenanceService;

    @GetMapping
    @Operation(summary = "Get all predictions",
            description = "Returns all predictive maintenance recommendations.")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getPredictions() {
        List<PredictionResponse> predictions = predictiveMaintenanceService.getPredictions();
        return ResponseEntity.ok(ApiResponse.success(predictions));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent predictions",
            description = "Returns predictions from the last N hours.")
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getRecentPredictions(
            @Parameter(description = "Number of hours to look back (default: 24)")
            @RequestParam(defaultValue = "24") int hours) {
        List<PredictionResponse> predictions = predictiveMaintenanceService.getRecentPredictions(hours);
        return ResponseEntity.ok(ApiResponse.success(predictions));
    }

    @GetMapping("/status")
    @Operation(summary = "Get maintenance status",
            description = "Returns current maintenance status: OK, ATTENTION, WARNING, or CRITICAL.")
    public ResponseEntity<ApiResponse<String>> getMaintenanceStatus() {
        String status = predictiveMaintenanceService.getMaintenanceStatus();
        return ResponseEntity.ok(ApiResponse.success("Maintenance status", status));
    }
}

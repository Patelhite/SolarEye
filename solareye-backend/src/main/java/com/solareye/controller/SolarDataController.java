package com.solareye.controller;

import com.solareye.dto.*;
import com.solareye.service.SolarDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solar")
@RequiredArgsConstructor
@Tag(name = "Solar Data", description = "Endpoints for solar sensor data ingestion and retrieval")
public class SolarDataController {

    private final SolarDataService solarDataService;

    @PostMapping("/data")
    @Operation(summary = "Save sensor data",
            description = "Receives sensor readings from NodeMCU ESP8266 or simulation engine. "
                    + "Automatically triggers alert analysis and predictive maintenance checks.")
    public ResponseEntity<ApiResponse<SolarDataResponse>> saveData(
            @Valid @RequestBody SolarDataDTO dto) {
        SolarDataResponse response = solarDataService.saveData(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sensor data saved successfully", response));
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest sensor reading",
            description = "Returns the most recent sensor data reading.")
    public ResponseEntity<ApiResponse<SolarDataResponse>> getLatestData() {
        SolarDataResponse response = solarDataService.getLatestData();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get historical data",
            description = "Returns sensor readings for the specified number of hours.")
    public ResponseEntity<ApiResponse<List<SolarDataResponse>>> getHistory(
            @Parameter(description = "Number of hours to look back (default: 24)")
            @RequestParam(defaultValue = "24") int hours) {
        List<SolarDataResponse> response = solarDataService.getHistory(hours);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/charts")
    @Operation(summary = "Get chart data",
            description = "Returns time-series data optimized for Chart.js rendering.")
    public ResponseEntity<ApiResponse<ChartDataResponse>> getChartData(
            @Parameter(description = "Number of hours of data for charts (default: 1)")
            @RequestParam(defaultValue = "1") int hours) {
        ChartDataResponse response = solarDataService.getChartData(hours);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary",
            description = "Returns aggregated data for all dashboard cards including latest readings, "
                    + "today's energy, alert counts, and maintenance status.")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
        DashboardSummaryResponse response = solarDataService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

package com.solareye.controller;

import com.solareye.dto.ApiResponse;
import com.solareye.service.SimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
@RequiredArgsConstructor
@Tag(name = "Simulation", description = "Dummy data simulator control for testing")
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping("/toggle")
    @Operation(summary = "Toggle simulation engine",
            description = "Enable or disable the dummy data simulator.")
    public ResponseEntity<ApiResponse<String>> toggleSimulation(
            @RequestParam boolean enabled) {
        simulationService.setEnabled(enabled);
        String status = enabled ? "Simulation ENABLED" : "Simulation DISABLED";
        return ResponseEntity.ok(ApiResponse.success(status, status));
    }

    @GetMapping("/status")
    @Operation(summary = "Get simulation status",
            description = "Check if the simulation engine is currently running.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSimulationStatus() {
        Map<String, Object> status = Map.of(
                "enabled", simulationService.isEnabled(),
                "intervalMs", 5000,
                "description", "Generates realistic solar data with time-of-day modelling"
        );
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}

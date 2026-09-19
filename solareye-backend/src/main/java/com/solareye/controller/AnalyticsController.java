package com.solareye.controller;

import com.solareye.dto.AnalyticsResponse;
import com.solareye.dto.ApiResponse;
import com.solareye.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Energy analytics and system performance metrics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @Operation(summary = "Get analytics summary",
            description = "Returns comprehensive analytics including daily, weekly, monthly energy "
                    + "generation, average efficiency, system uptime, and maintenance recommendations.")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalyticsSummary() {
        AnalyticsResponse response = analyticsService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

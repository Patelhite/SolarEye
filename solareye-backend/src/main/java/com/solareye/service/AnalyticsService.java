package com.solareye.service;

import com.solareye.dto.AnalyticsResponse;

public interface AnalyticsService {

    /**
     * Get comprehensive analytics including daily, weekly, monthly energy
     * and system performance metrics.
     */
    AnalyticsResponse getAnalytics();
}

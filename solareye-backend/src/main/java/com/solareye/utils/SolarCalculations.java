package com.solareye.utils;

/**
 * Solar energy calculation utilities.
 */
public final class SolarCalculations {

    private SolarCalculations() {
        // Utility class — no instantiation
    }

    /**
     * Calculate power from voltage and current.
     * P = V × I
     */
    public static double calculatePower(double voltage, double current) {
        return Math.round(voltage * current * 100.0) / 100.0;
    }

    /**
     * Calculate energy generated over an interval.
     * E = P × t (where t is in hours)
     *
     * @param powerWatts     Power in Watts
     * @param intervalSeconds Time interval in seconds
     * @return Energy in Watt-hours (Wh)
     */
    public static double calculateEnergy(double powerWatts, long intervalSeconds) {
        double hours = intervalSeconds / 3600.0;
        return Math.round(powerWatts * hours * 10000.0) / 10000.0;
    }

    /**
     * Calculate solar panel efficiency.
     * Efficiency = (Actual Power / Theoretical Max Power) × 100
     *
     * @param actualPower      Measured power output (W)
     * @param panelRating      Panel rated power (W)
     * @param lightIntensity   Current light intensity (lux)
     * @param maxLightIntensity Maximum expected light intensity (lux)
     * @return Efficiency percentage
     */
    public static double calculateEfficiency(double actualPower, double panelRating,
                                              double lightIntensity, double maxLightIntensity) {
        if (panelRating <= 0 || maxLightIntensity <= 0 || lightIntensity <= 0) {
            return 0.0;
        }
        double lightFactor = lightIntensity / maxLightIntensity;
        double theoreticalPower = panelRating * lightFactor;
        if (theoreticalPower <= 0) {
            return 0.0;
        }
        double efficiency = (actualPower / theoreticalPower) * 100.0;
        return Math.min(Math.round(efficiency * 100.0) / 100.0, 100.0);
    }

    /**
     * Calculate standard deviation for a set of values.
     * Used for voltage fluctuation detection.
     */
    public static double calculateStdDev(double[] values) {
        if (values == null || values.length < 2) {
            return 0.0;
        }
        double mean = 0.0;
        for (double v : values) {
            mean += v;
        }
        mean /= values.length;

        double sumSquares = 0.0;
        for (double v : values) {
            sumSquares += (v - mean) * (v - mean);
        }
        return Math.sqrt(sumSquares / (values.length - 1));
    }

    /**
     * Detect a decreasing trend using simple linear regression slope.
     *
     * @param values Array of sequential values
     * @return negative slope indicates decreasing trend
     */
    public static double calculateTrendSlope(double[] values) {
        if (values == null || values.length < 2) {
            return 0.0;
        }
        int n = values.length;
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumX2 += (double) i * i;
        }
        double denominator = n * sumX2 - sumX * sumX;
        if (denominator == 0) {
            return 0.0;
        }
        return (n * sumXY - sumX * sumY) / denominator;
    }

    /**
     * Determine system health based on current readings.
     */
    public static String determineSystemHealth(double voltage, double power,
                                                double temperature, double lightIntensity) {
        if (voltage <= 0 || (lightIntensity > 500 && power < 1.0)) {
            return "CRITICAL";
        }
        if (temperature > 50 || (lightIntensity > 500 && power < 3.0)) {
            return "WARNING";
        }
        if (temperature > 45 || voltage < 8.0) {
            return "FAIR";
        }
        return "GOOD";
    }
}

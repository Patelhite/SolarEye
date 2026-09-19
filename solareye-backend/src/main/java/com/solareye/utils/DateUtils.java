package com.solareye.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Date utility methods for time range calculations.
 */
public final class DateUtils {

    private static final DateTimeFormatter CHART_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final DateTimeFormatter FULL_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private DateUtils() {
        // Utility class — no instantiation
    }

    /**
     * Start of today (00:00:00).
     */
    public static LocalDateTime startOfToday() {
        return LocalDate.now().atStartOfDay();
    }

    /**
     * End of today (23:59:59.999).
     */
    public static LocalDateTime endOfToday() {
        return LocalDate.now().atTime(LocalTime.MAX);
    }

    /**
     * Start of this week (Monday 00:00:00).
     */
    public static LocalDateTime startOfWeek() {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1L);
        return monday.atStartOfDay();
    }

    /**
     * Start of this month (1st 00:00:00).
     */
    public static LocalDateTime startOfMonth() {
        return LocalDate.now().withDayOfMonth(1).atStartOfDay();
    }

    /**
     * N hours ago from now.
     */
    public static LocalDateTime hoursAgo(int hours) {
        return LocalDateTime.now().minus(hours, ChronoUnit.HOURS);
    }

    /**
     * N minutes ago from now.
     */
    public static LocalDateTime minutesAgo(int minutes) {
        return LocalDateTime.now().minus(minutes, ChronoUnit.MINUTES);
    }

    /**
     * Format a timestamp for chart labels (HH:mm:ss).
     */
    public static String formatForChart(LocalDateTime dateTime) {
        return dateTime.format(CHART_FORMATTER);
    }

    /**
     * Format a timestamp for full display (yyyy-MM-dd HH:mm:ss).
     */
    public static String formatFull(LocalDateTime dateTime) {
        return dateTime.format(FULL_FORMATTER);
    }
}

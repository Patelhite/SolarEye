package com.solareye.repository;

import com.solareye.entity.SolarData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SolarDataRepository extends JpaRepository<SolarData, Long> {

    /**
     * Get the most recent sensor reading.
     */
    Optional<SolarData> findTopByOrderByCreatedAtDesc();

    /**
     * Get data within a time range, ordered by time ascending.
     */
    List<SolarData> findByCreatedAtBetweenOrderByCreatedAtAsc(
            LocalDateTime start, LocalDateTime end);


    /**
     * Custom query: get last N readings for predictive analysis.
     */
    @Query(value = "SELECT * FROM solar_data ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<SolarData> findLatestReadings(@Param("limit") int limit);

    /**
     * Sum energy generated within a time range.
     */
    @Query("SELECT COALESCE(SUM(s.energy), 0) FROM SolarData s WHERE s.createdAt BETWEEN :start AND :end")
    Double sumEnergyBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Average power within a time range.
     */
    @Query("SELECT COALESCE(AVG(s.power), 0) FROM SolarData s WHERE s.createdAt BETWEEN :start AND :end")
    Double avgPowerBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Count readings within a time range.
     */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Get data after a specific timestamp.
     */
    List<SolarData> findByCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime after);

    /**
     * Average voltage for a time range.
     */
    @Query("SELECT COALESCE(AVG(s.voltage), 0) FROM SolarData s WHERE s.createdAt BETWEEN :start AND :end")
    Double avgVoltageBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Average temperature for a time range.
     */
    @Query("SELECT COALESCE(AVG(s.temperature), 0) FROM SolarData s WHERE s.createdAt BETWEEN :start AND :end")
    Double avgTemperatureBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

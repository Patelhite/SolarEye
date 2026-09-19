package com.solareye.repository;

import com.solareye.entity.MaintenancePrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaintenancePredictionRepository extends JpaRepository<MaintenancePrediction, Long> {

    List<MaintenancePrediction> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after);

    List<MaintenancePrediction> findAllByOrderByCreatedAtDesc();

    List<MaintenancePrediction> findByPredictionTypeOrderByCreatedAtDesc(String predictionType);

    /**
     * Check if a similar prediction was already generated recently to avoid duplicates.
     */
    boolean existsByPredictionTypeAndCreatedAtAfter(String predictionType, LocalDateTime after);
}

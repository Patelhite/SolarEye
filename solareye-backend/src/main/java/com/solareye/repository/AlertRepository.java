package com.solareye.repository;

import com.solareye.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByStatusOrderByCreatedAtDesc(String status);

    List<Alert> findBySeverityOrderByCreatedAtDesc(String severity);

    List<Alert> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after);

    List<Alert> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);

    long countBySeverity(String severity);

    /**
     * Check if a similar alert was already generated recently to avoid duplicates.
     */
    boolean existsByAlertTypeAndStatusAndCreatedAtAfter(
            String alertType, String status, LocalDateTime after);
}

-- ============================================================
-- SolarEye — Database Schema
-- Database: solar_monitoring
-- ============================================================

CREATE DATABASE IF NOT EXISTS solar_monitoring;
USE solar_monitoring;

-- ── Users Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        VARCHAR(20)     NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Solar Data Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solar_data (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    voltage         DOUBLE          NOT NULL DEFAULT 0.0,
    current_val     DOUBLE          NOT NULL DEFAULT 0.0,
    power           DOUBLE          NOT NULL DEFAULT 0.0,
    energy          DOUBLE          NOT NULL DEFAULT 0.0,
    temperature     DOUBLE          NOT NULL DEFAULT 0.0,
    humidity        DOUBLE          NOT NULL DEFAULT 0.0,
    light_intensity DOUBLE          NOT NULL DEFAULT 0.0,
    system_health   VARCHAR(20)     NOT NULL DEFAULT 'GOOD',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_solar_data_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Alerts Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    alert_type  VARCHAR(50)     NOT NULL,
    severity    VARCHAR(10)     NOT NULL DEFAULT 'GREEN',
    message     VARCHAR(500)    NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_alerts_status (status),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Maintenance Predictions Table ───────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_predictions (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    prediction_type     VARCHAR(100)    NOT NULL,
    confidence          DOUBLE          NOT NULL DEFAULT 0.0,
    recommendation      VARCHAR(500)    NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_predictions_type (prediction_type),
    INDEX idx_predictions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

# ☀️ SolarEye Backend

**Smart Solar Monitoring & Predictive Maintenance System using IoT**

---

## 📋 Prerequisites

| Requirement | Version |
|-------------|---------|
| Java JDK    | 17+     |
| Maven       | 3.8+    |
| MySQL       | 8.0+    |

---

## 🚀 Local Setup Guide

### Step 1: Install MySQL

Download and install MySQL from https://dev.mysql.com/downloads/installer/

### Step 2: Create the Database

Open MySQL command line or Workbench and run:

```sql
CREATE DATABASE solar_monitoring;
```

### Step 3: Configure Database Connection

Edit `src/main/resources/application.yml` and update:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/solar_monitoring?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
    username: root        # ← Your MySQL username
    password: root        # ← Your MySQL password
```

### Step 4: Build the Project

```bash
cd solareye-backend
mvn clean install -DskipTests
```

### Step 5: Run the Application

```bash
mvn spring-boot:run
```

### Step 6: Verify

| Resource       | URL                                           |
|----------------|-----------------------------------------------|
| Swagger UI     | http://localhost:8080/swagger-ui.html          |
| API Docs       | http://localhost:8080/v3/api-docs              |
| Latest Data    | http://localhost:8080/api/solar/latest         |
| Dashboard API  | http://localhost:8080/api/solar/dashboard      |
| Alerts         | http://localhost:8080/api/alerts               |
| Predictions    | http://localhost:8080/api/predictions          |
| Analytics      | http://localhost:8080/api/analytics/summary    |

---

## 🔑 Default Credentials

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@solareye.com   | admin123  |
| User  | user@solareye.com    | user123   |

> ⚠️ **Change these in production!**

---

## 🔬 Simulation Engine

The simulation engine automatically generates realistic solar data every **5 seconds**. It is **enabled by default**.

### Toggle Simulation

```bash
# Disable
curl -X POST "http://localhost:8080/api/simulation/toggle?enabled=false"

# Enable
curl -X POST "http://localhost:8080/api/simulation/toggle?enabled=true"

# Check Status
curl http://localhost:8080/api/simulation/status
```

### Simulation Features

- **Time-of-day modelling**: Solar data follows a natural bell curve (peak at noon)
- **Realistic ranges**: Voltage (5–18V), Current (0.2–3A), Temp (25–55°C)
- **Anomaly injection**: Periodically introduces faults to test alerts
- **Automatic analysis**: Each data point triggers alert + predictive maintenance checks

---

## 📡 REST API Summary

### Solar Data
| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| POST   | `/api/solar/data`      | Save sensor reading      |
| GET    | `/api/solar/latest`    | Latest sensor reading    |
| GET    | `/api/solar/history`   | Historical data          |
| GET    | `/api/solar/charts`    | Chart.js-ready data      |
| GET    | `/api/solar/dashboard` | Dashboard summary        |

### Alerts
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| GET    | `/api/alerts`               | All alerts         |
| GET    | `/api/alerts/recent`        | Recent alerts      |
| PUT    | `/api/alerts/{id}/resolve`  | Resolve an alert   |

### Predictive Maintenance
| Method | Endpoint                    | Description                |
|--------|-----------------------------|----------------------------|
| GET    | `/api/predictions`          | All predictions            |
| GET    | `/api/predictions/recent`   | Recent predictions         |
| GET    | `/api/predictions/status`   | Maintenance status         |

### Analytics
| Method | Endpoint                    | Description                |
|--------|-----------------------------|----------------------------|
| GET    | `/api/analytics/summary`    | Full analytics summary     |

### Authentication
| Method | Endpoint            | Description          |
|--------|---------------------|----------------------|
| POST   | `/api/auth/login`   | User login           |
| POST   | `/api/auth/logout`  | User logout          |
| GET    | `/api/auth/me`      | Current user info    |

### Simulation
| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| POST   | `/api/simulation/toggle`     | Enable/disable       |
| GET    | `/api/simulation/status`     | Check status         |

---

## 🗂️ Project Structure

```
solareye-backend/
├── pom.xml
├── src/main/java/com/solareye/
│   ├── SolarEyeApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── SwaggerConfig.java
│   │   ├── WebConfig.java
│   │   └── DataInitializer.java
│   ├── security/
│   │   ├── CustomUserDetailsService.java
│   │   └── AuthEntryPoint.java
│   ├── entity/          (User, SolarData, Alert, MaintenancePrediction)
│   ├── repository/      (JPA Repositories)
│   ├── dto/             (Request/Response DTOs)
│   ├── service/         (Interfaces)
│   │   └── impl/        (Implementations)
│   ├── controller/      (REST Controllers)
│   ├── exception/       (Global Exception Handler)
│   └── utils/           (DateUtils, SolarCalculations)
└── src/main/resources/
    ├── application.yml
    ├── schema.sql
    └── postman/
```

---

## 🔮 Future Scalability Notes

1. **JWT Authentication**: Replace session-based auth with JWT tokens for stateless scaling
2. **WebSocket**: Add real-time push via WebSocket instead of polling
3. **Machine Learning**: Integrate TensorFlow/ONNX models for advanced predictive maintenance
4. **Multi-Panel Support**: Add `panel_id` foreign key to support multiple solar panels
5. **MQTT Integration**: Add MQTT broker (Mosquitto) for IoT device communication
6. **Docker Deployment**: Containerize with Docker + Docker Compose
7. **Monitoring**: Add Prometheus + Grafana for application metrics
8. **Cloud**: Deploy to AWS/GCP with RDS for managed MySQL
9. **Data Archival**: Implement data partitioning for long-term historical data
10. **Mobile App**: Flutter/React Native app consuming the same REST APIs

---

## 📦 Deployment Guide

### Production Build

```bash
mvn clean package -DskipTests
java -jar target/solareye-backend-1.0.0.jar
```

### Environment Variables (Production)

```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://prod-host:3306/solar_monitoring
export SPRING_DATASOURCE_USERNAME=solareye_prod
export SPRING_DATASOURCE_PASSWORD=<secure-password>
export SOLAREYE_SIMULATION_ENABLED=false
```

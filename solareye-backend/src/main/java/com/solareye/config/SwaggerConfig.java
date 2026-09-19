package com.solareye.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI solarEyeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SolarEye API")
                        .description("Smart Solar Monitoring & Predictive Maintenance System using IoT.\n\n"
                                + "This API provides endpoints for:\n"
                                + "- **Solar Data**: Real-time sensor data ingestion and retrieval\n"
                                + "- **Alerts**: Automated threshold-based alert generation\n"
                                + "- **Predictive Maintenance**: AI-driven maintenance recommendations\n"
                                + "- **Analytics**: Energy generation and system performance metrics\n"
                                + "- **Simulation**: Dummy data generation for testing\n"
                                + "- **Authentication**: Session-based user management")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("SolarEye Team")
                                .email("admin@solareye.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Local Development Server")
                ));
    }
}

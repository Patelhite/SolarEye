package com.solareye.config;

import com.solareye.entity.User;
import com.solareye.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed default admin user if not exists
        if (!userRepository.existsByEmail("admin@solareye.com")) {
            User admin = User.builder()
                    .name("SolarEye Admin")
                    .email("admin@solareye.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .build();
            userRepository.save(admin);
            log.info("✅ Default admin user created: admin@solareye.com / admin123");
        } else {
            log.info("✅ Admin user already exists");
        }

        // Seed a regular user if not exists
        if (!userRepository.existsByEmail("user@solareye.com")) {
            User user = User.builder()
                    .name("SolarEye User")
                    .email("user@solareye.com")
                    .password(passwordEncoder.encode("user123"))
                    .role("USER")
                    .build();
            userRepository.save(user);
            log.info("✅ Default user created: user@solareye.com / user123");
        }

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("  ☀️  SolarEye Backend Started Successfully");
        log.info("  📊  Dashboard:  http://localhost:8080");
        log.info("  📖  Swagger UI: http://localhost:8080/swagger-ui.html");
        log.info("  🔬  Simulation: ENABLED (data every 5 seconds)");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
}

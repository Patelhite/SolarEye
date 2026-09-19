package com.solareye;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SolarEyeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SolarEyeApplication.class, args);
    }
}

package com.debate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DebatePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(DebatePlatformApplication.class, args);
    }
}

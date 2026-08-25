package com.quickdevbase;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class QuickDevBaseApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuickDevBaseApplication.class, args);
    }
}

package com.frauddetection.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class FallbackController {

    @GetMapping("/fallback/fraud")
    public ResponseEntity<Map<String, Object>> fraudFallback() {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "service", "fraud-detection-service",
                        "status", "UNAVAILABLE",
                        "message", "Fraud detection service is temporarily unavailable. Please try again later."
                ));
    }
}

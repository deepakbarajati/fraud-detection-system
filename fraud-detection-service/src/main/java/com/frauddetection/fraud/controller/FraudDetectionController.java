package com.frauddetection.fraud.controller;

import com.frauddetection.fraud.dto.AlertStatusUpdateRequestDTO;
import com.frauddetection.fraud.dto.FraudAlertPageResponseDTO;
import com.frauddetection.fraud.dto.FraudAlertResponseDTO;
import com.frauddetection.fraud.dto.FraudDashboardStatsDTO;
import com.frauddetection.fraud.model.AlertStatus;
import com.frauddetection.fraud.model.RiskLevel;
import com.frauddetection.fraud.service.FraudDetectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fraud")
@RequiredArgsConstructor
@Slf4j
@Tag(
        name = "Fraud Detection API",
        description = "Endpoints for fraud alerts and risk scores"
)
public class FraudDetectionController {

    private final FraudDetectionService fraudDetectionService;

    @GetMapping("/alerts")
    @Operation(summary = "Get all fraud alerts")
    public ResponseEntity<List<FraudAlertResponseDTO>> getAllAlerts() {
        return ResponseEntity.ok(
                fraudDetectionService.getAllAlerts()
        );
    }

    @GetMapping("/alerts/payment/{paymentId}")
    @Operation(summary = "Get fraud alert by payment ID")
    public ResponseEntity<FraudAlertResponseDTO> getAlertByPaymentId(
            @PathVariable String paymentId) {

        return ResponseEntity.ok(
                fraudDetectionService.getAlertByPaymentId(paymentId)
        );
    }

    @PatchMapping("/alerts/{alertId}/status")
    @Operation(summary = "Update fraud alert investigation status")
    public ResponseEntity<FraudAlertResponseDTO> updateAlertStatus(
            @PathVariable String alertId,
            @Valid @RequestBody AlertStatusUpdateRequestDTO request) {

        return ResponseEntity.ok(
                fraudDetectionService.updateAlertStatus(
                        alertId,
                        request.getStatus()
                )
        );
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get fraud dashboard statistics")
    public ResponseEntity<FraudDashboardStatsDTO> getDashboardStats() {

        return ResponseEntity.ok(
                fraudDetectionService.getDashboardStats()
        );
    }

    @GetMapping("/alerts/search")
    @Operation(summary = "Search and filter fraud alerts")
    public ResponseEntity<FraudAlertPageResponseDTO> searchAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) RiskLevel riskLevel,
            @RequestParam(required = false) String senderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                fraudDetectionService.searchAlerts(
                        status,
                        riskLevel,
                        senderId,
                        page,
                        size
                )
        );
    }

    @GetMapping("/alerts/status/{status}")
    @Operation(summary = "Get fraud alerts by status")
    public ResponseEntity<List<FraudAlertResponseDTO>> getAlertsByStatus(
            @PathVariable AlertStatus status) {

        return ResponseEntity.ok(
                fraudDetectionService.getAlertsByStatus(status)
        );
    }

    @GetMapping("/alerts/risk/{riskLevel}")
    @Operation(summary = "Get fraud alerts by risk level")
    public ResponseEntity<List<FraudAlertResponseDTO>> getAlertsByRiskLevel(
            @PathVariable RiskLevel riskLevel) {

        return ResponseEntity.ok(
                fraudDetectionService.getAlertsByRiskLevel(riskLevel)
        );
    }
}
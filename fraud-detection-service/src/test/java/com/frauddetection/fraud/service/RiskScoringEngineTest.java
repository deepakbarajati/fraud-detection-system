package com.frauddetection.fraud.service;

import com.frauddetection.fraud.client.PaymentServiceClient;
import com.frauddetection.fraud.dto.PaymentEventDTO;
import com.frauddetection.fraud.dto.RiskAssessmentDTO;
import com.frauddetection.fraud.repository.FraudAlertRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RiskScoringEngineTest {

    @Mock
    private FraudAlertRepository fraudAlertRepository;

    @Mock
    private PaymentServiceClient paymentServiceClient;

    @InjectMocks
    private RiskScoringEngine riskScoringEngine;

    @Test
    void shouldAddRiskForRecentRejectedPayments() {

        LocalDateTime createdAt = LocalDateTime.of(
                2026, 8, 25, 21, 42, 0
        );

        PaymentEventDTO event = PaymentEventDTO.builder()
                .paymentId("test-payment-001")
                .senderId("test-rejected-sender")
                .receiverId("test-receiver")
                .amount(BigDecimal.valueOf(100))
                .currency("USD")
                .ipAddress("10.20.0.1")
                .deviceId("test-device")
                .createdAt(createdAt)
                .build();

        when(paymentServiceClient.countRejectedPayments(
                eq("test-rejected-sender"),
                eq(createdAt.minusMinutes(10))
        )).thenReturn(5L);

        when(fraudAlertRepository.countRecentTransactionsBySender(
                anyString(),
                any(LocalDateTime.class)
        )).thenReturn(0L);

        when(fraudAlertRepository.countTransactionsBySender(
                anyString()
        )).thenReturn(0L);

        RiskAssessmentDTO assessment =
                riskScoringEngine.assess(event);

        assertTrue(assessment.getRiskScore() >= 25.0);

        assertTrue(
                assessment.getRiskReasons()
                        .stream()
                        .anyMatch(reason ->
                                reason.contains(
                                        "Multiple rejected payment attempts"
                                )
                        )
        );

        verify(paymentServiceClient).countRejectedPayments(
                "test-rejected-sender",
                createdAt.minusMinutes(10)
        );
    }
}

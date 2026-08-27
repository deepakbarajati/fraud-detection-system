package com.frauddetection.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlertEventDTO {

    private String alertId;
    private String paymentId;

    private String senderId;
    private String receiverId;

    private BigDecimal amount;
    private String currency;

    private double riskScore;
    private String riskLevel;

    private String riskReasons;
    private String aiExplanation;

    private String ipAddress;
    private String deviceId;

    private LocalDateTime createdAt;
}

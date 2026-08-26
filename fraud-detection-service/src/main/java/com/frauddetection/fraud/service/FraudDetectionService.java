package com.frauddetection.fraud.service;

import com.frauddetection.fraud.client.PaymentServiceClient;
import com.frauddetection.fraud.dto.FraudAlertPageResponseDTO;
import com.frauddetection.fraud.dto.FraudAlertResponseDTO;
import com.frauddetection.fraud.dto.FraudDashboardStatsDTO;
import com.frauddetection.fraud.dto.PaymentEventDTO;
import com.frauddetection.fraud.dto.RiskAssessmentDTO;
import com.frauddetection.fraud.model.AlertStatus;
import com.frauddetection.fraud.model.FraudAlert;
import com.frauddetection.fraud.model.RiskLevel;
import com.frauddetection.fraud.repository.FraudAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FraudDetectionService {

    private final FraudAlertRepository fraudAlertRepository;
    private final RiskScoringEngine riskScoringEngine;
    private final PaymentServiceClient paymentServiceClient;

    @Transactional
    public void processPaymentEvent(PaymentEventDTO event) {
        log.info("Processing payment event: {}", event.getPaymentId());

        // Run rule-based risk scoring
        RiskAssessmentDTO assessment = riskScoringEngine.assess(event);

        // Save fraud alert
        FraudAlert alert = FraudAlert.builder()
                .paymentId(event.getPaymentId())
                .senderId(event.getSenderId())
                .receiverId(event.getReceiverId())
                .amount(event.getAmount())
                .currency(event.getCurrency())
                .riskScore(assessment.getRiskScore())
                .riskLevel(assessment.getRiskLevel())
                .ipAddress(event.getIpAddress())
                .deviceId(event.getDeviceId())
                .riskReasons(String.join("; ", assessment.getRiskReasons()))
                .aiExplanation(assessment.getRiskReasons().isEmpty()
                        ? "No risk factors detected"
                        : "Rule-based analysis: " + assessment.getRiskReasons().size()
                        + " risk factor(s) identified")
                .build();

        FraudAlert saved = fraudAlertRepository.save(alert);

        log.info(
                "Fraud alert saved: {} | risk level: {}",
                saved.getId(),
                saved.getRiskLevel()
        );

        // Update payment status based on risk level
        if (assessment.getRiskLevel() == RiskLevel.CRITICAL ||
                assessment.getRiskLevel() == RiskLevel.HIGH) {

            log.warn(
                    "HIGH/CRITICAL risk detected for payment: {} — flagging",
                    event.getPaymentId()
            );

            paymentServiceClient.updatePaymentStatus(
                    event.getPaymentId(),
                    "FLAGGED"
            );

        } else {
            paymentServiceClient.updatePaymentStatus(
                    event.getPaymentId(),
                    "COMPLETED"
            );
        }
    }

    @Transactional
    public FraudAlertResponseDTO updateAlertStatus(
            String alertId,
            AlertStatus newStatus) {

        FraudAlert alert = fraudAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException(
                        "Fraud alert not found: " + alertId
                ));

        AlertStatus oldStatus = alert.getStatus();

        if (oldStatus == AlertStatus.RESOLVED ||
                oldStatus == AlertStatus.FALSE_POSITIVE) {

            throw new IllegalStateException(
                    "Closed fraud alerts cannot be modified. Current status: "
                            + oldStatus
            );
        }

        alert.setStatus(newStatus);

        FraudAlert updated = fraudAlertRepository.save(alert);

        log.info(
                "Fraud alert status updated | alertId: {} | paymentId: {} | {} -> {}",
                alertId,
                alert.getPaymentId(),
                oldStatus,
                newStatus
        );

        return mapToResponseDTO(updated);
    }

    public FraudDashboardStatsDTO getDashboardStats() {

        return FraudDashboardStatsDTO.builder()
                .totalAlerts(fraudAlertRepository.count())

                .openAlerts(
                        fraudAlertRepository.countByStatus(AlertStatus.OPEN)
                )

                .reviewingAlerts(
                        fraudAlertRepository.countByStatus(AlertStatus.REVIEWING)
                )

                .resolvedAlerts(
                        fraudAlertRepository.countByStatus(AlertStatus.RESOLVED)
                )

                .falsePositiveAlerts(
                        fraudAlertRepository.countByStatus(
                                AlertStatus.FALSE_POSITIVE
                        )
                )

                .highRiskAlerts(
                        fraudAlertRepository.countByRiskLevel(RiskLevel.HIGH)
                                + fraudAlertRepository.countByRiskLevel(
                                RiskLevel.CRITICAL
                        )
                )

                .criticalRiskAlerts(
                        fraudAlertRepository.countByRiskLevel(
                                RiskLevel.CRITICAL
                        )
                )

                .build();
    }

    public FraudAlertPageResponseDTO searchAlerts(
            AlertStatus status,
            RiskLevel riskLevel,
            String senderId,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );

        Page<FraudAlert> result =
                fraudAlertRepository.searchAlerts(
                        status,
                        riskLevel,
                        senderId,
                        pageable
                );

        List<FraudAlertResponseDTO> alerts =
                result.getContent()
                        .stream()
                        .map(this::mapToResponseDTO)
                        .collect(Collectors.toList());

        return FraudAlertPageResponseDTO.builder()
                .alerts(alerts)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    public FraudAlertResponseDTO getAlertByPaymentId(
            String paymentId) {

        FraudAlert alert =
                fraudAlertRepository.findByPaymentId(paymentId)
                        .orElseThrow(() -> new RuntimeException(
                                "Fraud alert not found for payment: "
                                        + paymentId
                        ));

        return mapToResponseDTO(alert);
    }

    public List<FraudAlertResponseDTO> getAlertsByStatus(
            AlertStatus status) {

        return fraudAlertRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<FraudAlertResponseDTO> getAllAlerts() {

        return fraudAlertRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<FraudAlertResponseDTO> getAlertsByRiskLevel(
            RiskLevel riskLevel) {

        return fraudAlertRepository.findByRiskLevel(riskLevel)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private FraudAlertResponseDTO mapToResponseDTO(
            FraudAlert alert) {

        return FraudAlertResponseDTO.builder()
                .id(alert.getId())
                .paymentId(alert.getPaymentId())
                .senderId(alert.getSenderId())
                .receiverId(alert.getReceiverId())
                .amount(alert.getAmount())
                .currency(alert.getCurrency())
                .riskScore(alert.getRiskScore())
                .riskLevel(alert.getRiskLevel())
                .status(alert.getStatus())
                .riskReasons(alert.getRiskReasons())
                .aiExplanation(alert.getAiExplanation())
                .ipAddress(alert.getIpAddress())
                .deviceId(alert.getDeviceId())
                .createdAt(
                        alert.getCreatedAt() != null
                                ? alert.getCreatedAt().toString()
                                : null
                )
                .build();
    }
}
package com.frauddetection.notification.kafka;

import com.frauddetection.notification.dto.FraudAlertEventDTO;
import com.frauddetection.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FraudAlertEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
            topics = "${kafka.topics.fraud-alerts}",
            groupId = "fraud-notification-group",
            containerFactory = "fraudAlertKafkaListenerContainerFactory"
    )
    public void consumeFraudAlert(
            @Payload FraudAlertEventDTO event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.warn(
                "Received fraud alert | topic: {} | partition: {} | offset: {} | " +
                        "paymentId: {} | riskLevel: {} | riskScore: {}",
                topic,
                partition,
                offset,
                event.getPaymentId(),
                event.getRiskLevel(),
                event.getRiskScore()
        );

        try {
            notificationService.processFraudAlert(event);

            log.info(
                    "Fraud notification processed | paymentId: {} | riskLevel: {}",
                    event.getPaymentId(),
                    event.getRiskLevel()
            );

        } catch (Exception e) {
            log.error(
                    "Error processing fraud notification | paymentId: {} | error: {}",
                    event.getPaymentId(),
                    e.getMessage(),
                    e
            );
        }
    }
}

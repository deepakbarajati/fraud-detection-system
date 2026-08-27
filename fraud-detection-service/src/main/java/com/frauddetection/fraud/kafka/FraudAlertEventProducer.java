package com.frauddetection.fraud.kafka;

import com.frauddetection.fraud.dto.FraudAlertEventDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FraudAlertEventProducer {

    private final KafkaTemplate<String, FraudAlertEventDTO> kafkaTemplate;

    private static final String TOPIC = "fraud-alerts";

    public void publishFraudAlert(FraudAlertEventDTO event) {

        log.info(
                "Publishing fraud alert event | alertId: {} | paymentId: {} | riskLevel: {}",
                event.getAlertId(),
                event.getPaymentId(),
                event.getRiskLevel()
        );

        kafkaTemplate.send(
                TOPIC,
                event.getPaymentId(),
                event
        );

        log.info(
                "Fraud alert event published | paymentId: {}",
                event.getPaymentId()
        );
    }
}

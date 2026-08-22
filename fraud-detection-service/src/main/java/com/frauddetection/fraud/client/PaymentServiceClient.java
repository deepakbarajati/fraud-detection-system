package com.frauddetection.fraud.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${services.payment-service.url}")
    private String paymentServiceUrl;

    public void updatePaymentStatus(String paymentId, String status) {
        log.info("Updating payment {} status to {}", paymentId, status);
        try {
            webClientBuilder.build()
                    .patch()
                    .uri(paymentServiceUrl + "/api/v1/payments/{id}/status?status={status}",
                            paymentId, status)
                    .retrieve()
                    .bodyToMono(String.class)
                    .doOnSuccess(response ->
                            log.info("Payment {} status updated to {}", paymentId, status))
                    .doOnError(error ->
                            log.error("Failed to update payment {} status: {}",
                                    paymentId, error.getMessage()))
                    .subscribe();
        } catch (Exception e) {
            log.error("Error calling payment service: {}", e.getMessage());
        }
    }


    public long countRejectedPayments(
            String senderId,
            LocalDateTime since) {

        try {
            Long count = webClientBuilder.build()
                    .get()
                    .uri(paymentServiceUrl +
                                    "/api/v1/payments/sender/{senderId}/failed-count" +
                                    "?since={since}",
                            senderId,
                            since)
                    .retrieve()
                    .bodyToMono(Long.class)
                    .block();

            return count != null ? count : 0;

        } catch (Exception e) {
            log.error(
                    "Failed to get rejected payment count for sender {}: {}",
                    senderId,
                    e.getMessage()
            );

            return 0;
        }
    }
}
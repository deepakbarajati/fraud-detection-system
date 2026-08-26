package com.frauddetection.fraud.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudDashboardStatsDTO {

    private long totalAlerts;
    private long openAlerts;
    private long reviewingAlerts;
    private long resolvedAlerts;
    private long falsePositiveAlerts;
    private long highRiskAlerts;
    private long criticalRiskAlerts;
}

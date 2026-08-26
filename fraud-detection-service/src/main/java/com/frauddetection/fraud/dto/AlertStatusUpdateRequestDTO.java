package com.frauddetection.fraud.dto;

import com.frauddetection.fraud.model.AlertStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertStatusUpdateRequestDTO {

    @NotNull(message = "Status is required")
    private AlertStatus status;
}

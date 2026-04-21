package com.rms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RefundRequestDTO {
    @NotNull(message = "Payment ID is required")
    private String paymentId;

    @NotNull(message = "Refund amount is required")
    private BigDecimal amount;

    private String reason;
}

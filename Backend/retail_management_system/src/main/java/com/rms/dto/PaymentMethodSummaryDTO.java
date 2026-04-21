package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentMethodSummaryDTO {
    private String paymentMethod;
    private Long count;
    private BigDecimal amount;
}


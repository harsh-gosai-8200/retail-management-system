package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentStatsDTO {
    private long totalTransactions;
    private long successfulTransactions;
    private long failedTransactions;
    private long refundedTransactions;
    private BigDecimal totalAmount;
}
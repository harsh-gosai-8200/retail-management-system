package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceStatsDTO {
    private long total;
    private long pending;
    private long paid;
    private long overdue;
    private double totalAmount;
}

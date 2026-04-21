package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RefundResponseDTO {
    private boolean success;
    private String refundId;
    private BigDecimal amount;
    private String status;
    private String message;
}
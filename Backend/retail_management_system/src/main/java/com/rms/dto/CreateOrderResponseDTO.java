package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CreateOrderResponseDTO {
    private String razorpayOrderId;
    private String razorpayKeyId;
    private Long orderId;
    private String orderNumber;
    private BigDecimal amount;
    private String currency;
}
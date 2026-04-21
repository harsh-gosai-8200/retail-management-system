package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentTransactionDTO {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private Boolean isRefunded;
    private BigDecimal refundAmount;
    private String failureReason;
}
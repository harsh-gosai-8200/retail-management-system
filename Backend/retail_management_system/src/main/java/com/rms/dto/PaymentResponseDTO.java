package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDTO {
    private boolean success;
    private String message;
    private Long orderId;
    private String orderNumber;
    private String paymentId;
    private String status;
    private Long transactionId;
}

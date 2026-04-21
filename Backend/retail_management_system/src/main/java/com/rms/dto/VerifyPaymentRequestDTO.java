package com.rms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyPaymentRequestDTO {

    @NotNull(message = "Razorpay order ID is required")
    private String razorpayOrderId;

    @NotNull(message = "Razorpay payment ID is required")
    private String razorpayPaymentId;

    @NotNull(message = "Razorpay signature is required")
    private String razorpaySignature;

    @NotNull(message = "Order ID is required")
    private Long orderId;
}
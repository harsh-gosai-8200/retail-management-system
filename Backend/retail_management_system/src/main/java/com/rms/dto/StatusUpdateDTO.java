package com.rms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StatusUpdateDTO {
    @NotBlank(message = "Status is required")
    private String status; // PROCESSING, SHIPPED, DELIVERED

    private String comments;

    private String trackingNumber; // For shipped orders
    private String estimatedDelivery;
}
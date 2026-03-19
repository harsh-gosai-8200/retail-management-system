package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DeliveryResponseDTO {
    private Long orderId;
    private String orderNumber;
    private String status;
    private LocalDateTime deliveredAt;
    private String receiverName;
    private String receiverPhone;
    private String deliveryPhoto;
    private String notes;
    private String message;
}
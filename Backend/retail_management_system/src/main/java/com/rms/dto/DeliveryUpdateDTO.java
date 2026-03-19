package com.rms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeliveryUpdateDTO {
    @NotBlank(message = "Status is required")
    private String status;
    private String notes;
    private String deliveryPhoto;
    private String receiverName;
    private String receiverPhone;
    private String deliveryLatitude;
    private String deliveryLongitude;
}
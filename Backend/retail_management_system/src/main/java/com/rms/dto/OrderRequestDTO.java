
package com.rms.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDTO {
    @NotNull(message = "Wholesaler ID is required")
    private Long wholesalerId;

    @NotNull(message = "Seller ID is required")
    private Long sellerId;

    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequestDTO> items;

    private String deliveryAddress;
    private String deliveryInstructions;
    private String paymentMethod;  // CASH, UPI, BANK_TRANSFER
    private String upiId;
}
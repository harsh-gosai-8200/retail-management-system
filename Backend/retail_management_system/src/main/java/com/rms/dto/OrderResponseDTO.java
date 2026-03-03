
package com.rms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long id;
    private String orderNumber;
    private Long sellerId;
    private String sellerName;
    private String sellerShopName;
    private Long wholesalerId;
    private String wholesalerName;
    private List<OrderItemDTO> items;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime orderDate;
    private LocalDateTime updatedAt;
    private String deliveryAddress;
}
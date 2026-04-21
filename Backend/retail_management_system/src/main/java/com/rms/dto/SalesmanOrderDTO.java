package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SalesmanOrderDTO {
    private Long orderId;
    private String orderNumber;
    private Long sellerId;
    private String sellerName;
    private String sellerShop;
    private String sellerPhone;
    private String sellerAddress;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime orderDate;
    private LocalDateTime expectedDelivery;
    private String deliveryAddress;
    private Integer itemCount;
    private List<SalesmanOrderItemDTO> items;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private LocalDateTime deliveredAt;
}

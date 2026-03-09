package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderPreviewDTO {
    private Long orderId;
    private String orderNumber;
    private String sellerName;
    private String sellerShop;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime orderDate;
    private Integer itemCount;
}
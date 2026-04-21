package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class TopSellerDTO {
    private Long sellerId;
    private String sellerName;
    private String shopName;
    private String ownerName;
    private String phone;
    private Long orderCount;
    private BigDecimal totalSpent;
    private BigDecimal averageOrderValue;
}
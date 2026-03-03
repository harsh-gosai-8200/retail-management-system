
package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class OrderSummaryDTO {
    private Long totalOrders;
    private Long pendingOrders;
    private Long approvedOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;
    private BigDecimal totalSpent;
    private BigDecimal averageOrderValue;
}
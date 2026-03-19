package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class SalesmanDashboardDTO {
    private Long totalAssignedSellers;
    private Long pendingDeliveries;
    private Long completedToday;
    private Long totalCompleted;
    private BigDecimal totalCollection;
    private BigDecimal estimatedCommission;
    private List<AssignedSellerDTO> recentSellers;
    private List<SalesmanOrderDTO> todayDeliveries;
    private Map<String, Long> deliveryStats;
}
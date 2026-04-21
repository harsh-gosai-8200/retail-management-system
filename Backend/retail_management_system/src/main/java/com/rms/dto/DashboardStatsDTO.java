package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardStatsDTO {
    // User Stats
    private long totalUsers;
    private long activeWholesalers;
    private long activeLocalSellers;
    private long activeSalesmen;
    private long inactiveUsers;

    // Order Stats
    private long totalOrders;
    private long ordersToday;
    private BigDecimal revenueToday;
    private BigDecimal revenueThisMonth;

    // Subscription Stats
    private long activeSubscriptions;
    private long expiredSubscriptions;
    private BigDecimal totalSubscriptionRevenue;

    // Support Stats
    private long openTickets;
    private long highPriorityTickets;
}
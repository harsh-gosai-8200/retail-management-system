package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class WholesalerStatsDTO {
    // Order counts by status
    private Long totalOrders;
    private Long pendingOrders;
    private Long approvedOrders;
    private Long processingOrders;
    private Long shippedOrders;
    private Long deliveredOrders;
    private Long rejectedOrders;
    private Long cancelledOrders;

    // Revenue statistics
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal thisWeekRevenue;
    private BigDecimal thisMonthRevenue;
    private BigDecimal averageOrderValue;

    // Seller statistics
    private Long totalSellers;
    private Long activeSellers;
    private Long newSellersThisMonth;

    // Product statistics
    private Long totalProducts;
    private Long lowStockProducts;
    private Long outOfStockProducts;

    // Top sellers (for dashboard)
    private List<TopSellerDTO> topSellers;

    // Recent orders preview
    private List<OrderPreviewDTO> recentOrders;

    // Orders by status chart data
    private Map<String, Long> ordersByStatusChart;

    // Revenue by day (for charts)
    private Map<String, BigDecimal> revenueByDay;
}
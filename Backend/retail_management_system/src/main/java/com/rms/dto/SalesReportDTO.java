package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class SalesReportDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate generatedAt;

    // Summary
    private BigDecimal totalRevenue;
    private BigDecimal totalCommission;
    private BigDecimal netRevenue;
    private Long totalOrders;
    private Long completedOrders;
    private Long cancelledOrders;

    // Breakdown
    private List<DailySalesDTO> dailySales;
    private List<PaymentMethodSummaryDTO> paymentMethodSummary;
    private List<TopProductDTO> topProducts;
    private List<TopSellerDTO> topSellers;
}

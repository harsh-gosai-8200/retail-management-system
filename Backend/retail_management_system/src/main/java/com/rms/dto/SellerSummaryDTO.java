package com.rms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import com.rms.model.LocalSeller;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class SellerSummaryDTO {
    private long ordersCount;
    private BigDecimal totalSpent;
    private LocalSeller seller;
}
package com.rms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class OrderItemSummaryDTO {
    private Long productId;
    private String productName;
    private long quantity;
    private BigDecimal revenue;
}

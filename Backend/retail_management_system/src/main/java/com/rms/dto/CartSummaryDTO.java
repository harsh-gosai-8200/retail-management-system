
package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class CartSummaryDTO {
    private List<CartItemDTO> items;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private Map<Long, String> wholesalerGroups;  // Group items by wholesaler
}
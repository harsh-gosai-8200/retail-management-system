
package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal total;
    private Integer availableStock;
    private Long wholesalerId;
    private String wholesalerName;
}
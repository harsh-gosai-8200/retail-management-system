
package com.rms.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal total;
}
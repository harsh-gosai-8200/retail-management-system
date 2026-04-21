package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TopProductDTO {
    private Long productId;
    private String productName;
    private Long quantitySold;
    private BigDecimal revenue;
}

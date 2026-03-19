package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SalesmanAssignmentResponseDTO {
    private Long id;
    private Long salesmanId;
    private String salesmanName;
    private Long sellerId;
    private String sellerName;
    private String sellerShop;
    private LocalDateTime assignedAt;
    private String status;
}

package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderApprovalDTO {
    private Long orderId;
    private String orderNumber;
    private String status;
    private LocalDateTime approvedAt;
    private String approvedBy;
    private String message;
}
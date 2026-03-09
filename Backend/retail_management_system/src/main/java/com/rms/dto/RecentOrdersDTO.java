package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RecentOrdersDTO {
    private List<OrderPreviewDTO> orders;
    private Long totalRecent;
    private Long pendingCount;
    private Long processingCount;
    private Long shippedCount;
}
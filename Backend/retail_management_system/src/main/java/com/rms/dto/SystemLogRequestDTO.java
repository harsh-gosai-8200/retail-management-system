package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SystemLogRequestDTO {
    private Long userId;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private String ipAddress;
}
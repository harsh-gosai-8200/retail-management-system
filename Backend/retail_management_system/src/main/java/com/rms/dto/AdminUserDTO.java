package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserDTO {
    private Long id;
    private Long profileId;
    private String username;
    private String email;
    private String phone;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    // Role-specific fields
    private String businessName;
    private String shopName;
    private String region;
}
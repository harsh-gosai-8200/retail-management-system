package com.rms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class UserReportDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate generatedAt;

    // Summary
    private long totalUsers;
    private long newUsers;
    private long activeUsers;
    private long inactiveUsers;

    // Role breakdown
    private long wholesalersCount;
    private long localSellersCount;
    private long salesmenCount;
    private long adminsCount;

    // Details
    private List<UserRegistrationDTO> newRegistrations;
    private List<RoleDistributionDTO> roleDistribution;
}
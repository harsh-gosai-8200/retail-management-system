package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SalesmanProfileDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String employeeId;
    private String region;
    private String department;
    private Double commissionRate;
    private Double salary;
    private String wholesalerName;
    private String wholesalerAddress;
    private String wholesalerPhone;
    private Long assignedSellersCount;
    private String status;
}

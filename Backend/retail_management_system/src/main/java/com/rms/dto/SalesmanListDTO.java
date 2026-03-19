package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SalesmanListDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String employeeId;
    private String region;
    private String status;
    private Long assignedSellersCount;

}

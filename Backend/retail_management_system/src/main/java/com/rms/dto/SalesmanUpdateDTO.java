package com.rms.dto;

import lombok.Data;

@Data
public class SalesmanUpdateDTO {

    private String fullName;
    private String phone;
    private String region;
    private String department;
    private Double commissionRate;
    private Double salary;
    private String emergencyContact;
    private String emergencyContactName;
    private Boolean isActive;

}

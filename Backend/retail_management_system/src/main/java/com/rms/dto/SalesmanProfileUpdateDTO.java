package com.rms.dto;

import lombok.Data;

@Data
public class SalesmanProfileUpdateDTO {
    private String fullName;
    private String phone;
    private String emergencyContact;
    private String emergencyContactName;
}
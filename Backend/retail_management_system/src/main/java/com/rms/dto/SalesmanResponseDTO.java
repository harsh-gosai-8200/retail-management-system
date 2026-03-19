package com.rms.dto;

import jdk.jshell.Snippet;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class SalesmanResponseDTO {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String employeeId;
    private String region;
    private String department;
    private Double commissionRate;
    private Double salary;
    private String status;
    private Long assignedSellersCount;
    private LocalDateTime createdAt;
    private String aadharNumber;
    private String panNumber;
    private String emergencyContact;
    private String emergencyContactName;
    private LocalDate joiningDate;

}

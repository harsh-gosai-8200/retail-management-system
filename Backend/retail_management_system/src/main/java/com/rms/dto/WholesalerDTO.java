package com.rms.dto;

import lombok.Data;

@Data
public class WholesalerDTO {

    private Long id;

    private String businessName;

    private String address;

    private String gstNumber;

    private Boolean isActive;

    // Optional: basic user info (if needed for display)
//    private String username;
//    private String email;
}
package com.rms.dto;

import com.rms.model.enums.Role;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    private String username;
    private String email;
    private String password;
    private String phone;
    private String address;
    private Role role;

    //for Wholesaler
    private String businessName;
    private String gstNumber;

    //for localseller
    private String shopName;
    private Double latitude;
    private Double longitude;

    // For salesman
    private String region;
    private Long wholesalerId;

}

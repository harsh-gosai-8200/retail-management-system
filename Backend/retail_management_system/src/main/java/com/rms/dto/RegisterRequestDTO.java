package com.rms.dto;

import com.rms.model.Role;
import lombok.Data;

@Data
public class RegisterRequestDTO {

    private String name;
    private String email;
    private String password;
    private String phone;


    private Role role;

    //for Wholesaler
    private String businessName;
    private String address;
    private String gstNumber;

    //for localseller
    private String shopName;
    private Double latitude;
    private Double longitude;


}

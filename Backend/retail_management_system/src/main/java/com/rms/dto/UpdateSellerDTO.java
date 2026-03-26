package com.rms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateSellerDTO {

    private String username;   // from User
    private String phone;
    private  String email; // from User
    private String city;

    private String shopName;   // from LocalSeller
    private String address;

}

package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SellerDTO {
    private Long id;
    private String shopName;
    private String ownerName;
    private String phone;
    private String address;
    private String city;
    private String pincode;
    private Boolean isActive;
}
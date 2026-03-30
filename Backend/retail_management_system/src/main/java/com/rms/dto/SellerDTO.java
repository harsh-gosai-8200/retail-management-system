package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SellerDTO {
    private Long id;
    private String shopName;
    private String email;
    private String username;
    private String phone;
    private String address;
    private Boolean isActive;
}
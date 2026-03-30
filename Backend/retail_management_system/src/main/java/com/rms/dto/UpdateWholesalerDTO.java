package com.rms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWholesalerDTO {

    private String username;
    private String email;
    private String phone;
    private String businessName;
    private String address;
    private String gstNumber;
}
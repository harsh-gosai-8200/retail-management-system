package com.rms.dto;

import com.rms.model.enums.SubscriptionStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WholesalerDTO {

    private Long id;

    private String businessName;

    private String address;

    private String gstNumber;

    private Boolean isActive;

    private SubscriptionStatus status;

    private String username;

    private String email;

    private String phone;

}
package com.rms.dto;

import com.rms.model.SubscriptionStatus;
import lombok.Data;

@Data
public class SubscriptionDTO {

    private Long id;

    private Long localSellerId;
    private String localSellerName;

    private Long wholesalerId;
    private String wholesalerName;

    private SubscriptionStatus status;
}
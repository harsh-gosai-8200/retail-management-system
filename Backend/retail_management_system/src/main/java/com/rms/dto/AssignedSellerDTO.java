package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AssignedSellerDTO {
    private Long sellerId;
    private String shopName;
    private String ownerName;
    private String phone;
    private String address;
    private Long pendingOrders;
    private Long totalOrders;
    private String lastOrderDate;
}

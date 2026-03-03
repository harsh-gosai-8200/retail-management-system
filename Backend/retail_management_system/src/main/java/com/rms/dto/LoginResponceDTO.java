package com.rms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponceDTO {
    private String token;
    private String tokenType;
    private Long userId;           // User table ID (for auth)
    private Long roleId;           // ✅ ADD THIS - Wholesaler ID or Seller ID
    private String role;            // WHOLESALER, LOCAL_SELLER, SALESMAN
    private String email;
    private String username;
    private String businessName;    // For wholesaler
    private String shopName;        // For seller
}
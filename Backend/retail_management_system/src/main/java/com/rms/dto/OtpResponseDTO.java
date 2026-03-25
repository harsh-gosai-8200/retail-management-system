package com.rms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OtpResponseDTO {
    private boolean success;
    private String message;
    private String email;
}
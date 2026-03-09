package com.rms.dto;

import lombok.Data;

@Data
public class StatusUpdateRequestDTO {
    private String status;
    private String comments;
}
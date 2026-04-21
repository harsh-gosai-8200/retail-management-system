package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserRegistrationDTO {
    private LocalDate date;
    private long wholesalers;
    private long localSellers;
    private long salesmen;
    private long total;
}

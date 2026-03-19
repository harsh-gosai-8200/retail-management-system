package com.rms.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SalesmanAssignmentDTO {
    @NotNull(message = "Salesman ID is required")
    private Long salesmanId;

    @NotEmpty(message = "At least one seller must be selected")
    private List<Long> sellerIds;
}

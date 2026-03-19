package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PaginatedResponseDTO<T> {
    private List<T> content;
    private int currentPage;
    private long totalItems;
    private int totalPages;
    private int pageSize;
    private boolean last;
}

package com.rms.service;

import com.rms.dto.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WholesalerSalesmanService {

    SalesmanResponseDTO createSalesman(Long wholesalerId, SalesmanRegistrationRequest request);

    PaginatedResponseDTO<SalesmanListDTO> getSalesmen(Long wholesalerId, String search,
                                                      Boolean isActive, String region,
                                                      Pageable pageable);

    SalesmanResponseDTO getSalesmanById(Long wholesalerId, Long salesmanId);

    SalesmanResponseDTO updateSalesman(Long wholesalerId, Long salesmanId, SalesmanUpdateDTO updateDTO);

    SalesmanResponseDTO toggleSalesmanStatus(Long wholesalerId, Long salesmanId, Boolean isActive);

    SalesmanAssignmentResponseDTO assignSellers(Long wholesalerId, SalesmanAssignmentDTO assignmentDTO);

    void removeAssignment(Long wholesalerId, Long assignmentId);

    PaginatedResponseDTO<SalesmanAssignmentResponseDTO> getAssignedSellers(Long wholesalerId,
                                                                           Long salesmanId,
                                                                           Pageable pageable);

    Long getAssignedSellersCount(Long salesmanId);

    List<SellerDTO> getAvailableSellers(Long wholesalerId);
}

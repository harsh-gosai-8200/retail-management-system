package com.rms.service;

import com.rms.dto.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SalesmanSelfService {

    SalesmanProfileDTO getMyProfile(Long salesmanId);
    SalesmanProfileDTO updateMyProfile(Long salesmanId, SalesmanProfileUpdateDTO updateDTO);

    List<AssignedSellerDTO> getMyAssignedSellers(Long salesmanId);

    PaginatedResponseDTO<SalesmanOrderDTO> getOrdersFromMySellers(
            Long salesmanId, String status, Pageable pageable);
    SalesmanOrderDTO getOrderDetails(Long salesmanId, Long orderId);

    DeliveryResponseDTO markOrderAsDelivered(
            Long salesmanId, Long orderId, DeliveryUpdateDTO deliveryDTO);
    DeliveryResponseDTO updateDeliveryStatus(
            Long salesmanId, Long orderId, String status, String notes);

    SalesmanDashboardDTO getMyDashboardStats(Long salesmanId);

    List<SalesmanOrderDTO> getSellerOrders(Long salesmanId, Long sellerId, String status);
}

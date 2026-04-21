package com.rms.service;

import com.rms.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface AdminService {

    DashboardStatsDTO getDashboardStats();

    Page<AdminUserDTO> getAllUsers(String role, Boolean isActive, String search, Pageable pageable);
    AdminUserDTO getUserDetails(Long userId);
    AdminUserDTO toggleUserStatus(Long userId);

    Page<PaymentTransactionDTO> getAllPayments(String status, String paymentMethod,
                                               LocalDateTime startDate, LocalDateTime endDate,
                                               Long userId, Pageable pageable);
    PaymentTransactionDTO getPaymentDetails(Long paymentId);
    Page<PaymentTransactionDTO> getUserPayments(Long userId, Pageable pageable);


    Page<OrderResponseDTO> getAllOrders(String status, String paymentStatus,
                                        LocalDateTime startDate, LocalDateTime endDate,
                                        Long userId, Pageable pageable);

    OrderResponseDTO getOrderDetails(Long orderId);

    Page<OrderResponseDTO> getUserOrders(Long userId, String status, Pageable pageable);
}
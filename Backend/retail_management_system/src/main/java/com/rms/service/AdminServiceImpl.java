 package com.rms.service;

import com.rms.dto.*;
import com.rms.dto.PaymentTransactionDTO;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.*;
import com.rms.model.enums.OrderStatus;
import com.rms.model.enums.PaymentStatus;
import com.rms.repository.*;
import com.rms.specification.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final WholesalerRepository wholesalerRepository;
    private final LocalSellerRepository localSellerRepository;
    private final SalesmanRepository salesmanRepository;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;


    /**
     * getting dashboard statistics for admin dashboard
     * @return
     */
    @Override
    public DashboardStatsDTO getDashboardStats() {
        log.info("Fetching dashboard stats");

        // User Stats
        long totalUsers = userRepository.count();
        long activeWholesalers = userRepository.count(
                Specification.where(UserSpecification.byRole("WHOLESALER"))
                        .and(UserSpecification.byActive(true)));
        long activeLocalSellers = userRepository.count(
                Specification.where(UserSpecification.byRole("LOCAL_SELLER"))
                        .and(UserSpecification.byActive(true)));
        long activeSalesmen = userRepository.count(
                Specification.where(UserSpecification.byRole("SALESMAN"))
                        .and(UserSpecification.byActive(true)));
        long inactiveUsers = userRepository.count(UserSpecification.byActive(false));

        // Order Stats
        long totalOrders = orderRepository.count();
        long ordersToday = orderRepository.count(
                OrderSpecification.createdAfter(LocalDateTime.now().with(LocalTime.MIN)));

        // Payment Stats - using Specifications
        BigDecimal revenueToday = getTotalAmountByStatusAndDate(PaymentStatus.SUCCESS,
                LocalDateTime.now().with(LocalTime.MIN),
                LocalDateTime.now().with(LocalTime.MAX));
        BigDecimal revenueThisMonth = getTotalAmountByStatusAndDate(PaymentStatus.SUCCESS,
                LocalDateTime.now().withDayOfMonth(1).with(LocalTime.MIN),
                LocalDateTime.now());


        return DashboardStatsDTO.builder()
                .totalUsers(totalUsers)
                .activeWholesalers(activeWholesalers)
                .activeLocalSellers(activeLocalSellers)
                .activeSalesmen(activeSalesmen)
                .inactiveUsers(inactiveUsers)
                .totalOrders(totalOrders)
                .ordersToday(ordersToday)
                .revenueToday(revenueToday != null ? revenueToday : BigDecimal.ZERO)
                .revenueThisMonth(revenueThisMonth != null ? revenueThisMonth : BigDecimal.ZERO)
                .build();
    }


    /**
     * getting all users for admin
     * @param role
     * @param isActive
     * @param search
     * @param pageable
     * @return
     */
    @Override
    public Page<AdminUserDTO> getAllUsers(String role, Boolean isActive, String search, Pageable pageable) {
        log.info("Fetching users - role: {}, active: {}, search: {}", role, isActive, search);

        Specification<User> spec = UserSpecification.withFilters(role, isActive, search);
        return userRepository.findAll(spec, pageable)
                .map(this::mapToAdminUserDTO);
    }

    /**
     * getting particular user's details
     * @param userId
     * @return
     */
    @Override
    public AdminUserDTO getUserDetails(Long userId) {
        log.info("Fetching user details for ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToAdminUserDTO(user);
    }

    /**
     * toggling user status
     * @param userId
     * @return
     */
    @Override
    @Transactional
    public AdminUserDTO toggleUserStatus(Long userId) {
        log.info("Toggling user status for ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setIsActive(!user.getIsActive());
        User saved = userRepository.save(user);

        log.info("User {} status toggled to: {}", userId, saved.getIsActive());

        return mapToAdminUserDTO(saved);
    }

    /**
     * getting all payments done in the system
     * @param status
     * @param paymentMethod
     * @param startDate
     * @param endDate
     * @param userId
     * @param pageable
     * @return
     */
    @Override
    public Page<PaymentTransactionDTO> getAllPayments(String status, String paymentMethod,
                                                      LocalDateTime startDate, LocalDateTime endDate,
                                                      Long userId, Pageable pageable) {
        log.info("Fetching all payments - userId: {}, status: {}, paymentMethod: {}, startDate: {}, endDate: {}",
                userId, status, paymentMethod, startDate, endDate);

        Specification<PaymentTransaction> spec = Specification.where(
                PaymentTransactionSpecification.byDateRange(startDate, endDate));

        if (userId != null) {
            spec = spec.and(PaymentTransactionSpecification.bySellerId(userId));
        }

        if (StringUtils.hasText(status)) {
            try {
                PaymentStatus paymentStatus = PaymentStatus.valueOf(status);
                spec = spec.and(PaymentTransactionSpecification.byStatus(paymentStatus));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid payment status: {}", status);
            }
        }

        if (StringUtils.hasText(paymentMethod)) {
            spec = spec.and(PaymentTransactionSpecification.byPaymentMethod(paymentMethod));
        }

        return paymentTransactionRepository.findAll(spec, pageable)
                .map(this::mapToPaymentTransactionDTO);
    }

    /**
     * getting particular payment details
     * @param paymentId
     * @return
     */
    @Override
    public PaymentTransactionDTO getPaymentDetails(Long paymentId) {
        log.info("Fetching payment details for ID: {}", paymentId);

        PaymentTransaction transaction = paymentTransactionRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        return mapToPaymentTransactionDTO(transaction);
    }

    /**
     * getting particular users payment
     * @param userId
     * @param pageable
     * @return
     */
    @Override
    public Page<PaymentTransactionDTO> getUserPayments(Long userId, Pageable pageable) {
        log.info("Fetching payments for user ID: {}", userId);

        Specification<PaymentTransaction> spec = PaymentTransactionSpecification.bySellerId(userId);

        return paymentTransactionRepository.findAll(spec, pageable)
                .map(this::mapToPaymentTransactionDTO);
    }

    /**
     * getting all orders for admin
     * @param status
     * @param paymentStatus
     * @param startDate
     * @param endDate
     * @param userId
     * @param pageable
     * @return
     */
    @Override
    public Page<OrderResponseDTO> getAllOrders(String status, String paymentStatus,
                                               LocalDateTime startDate, LocalDateTime endDate,
                                               Long userId, Pageable pageable) {
        log.info("Fetching all orders - status: {}, paymentStatus: {}, startDate: {}, endDate: {}, userId: {}",
                status, paymentStatus, startDate, endDate, userId);

        Specification<Order> spec = Specification.where(
                OrderSpecification.byDateRange(startDate, endDate));

        if (StringUtils.hasText(status)) {
            spec = spec.and(OrderSpecification.byStatus(OrderStatus.valueOf(status)));
        }

        if (StringUtils.hasText(paymentStatus)) {
            spec = spec.and(OrderSpecification.byPaymentStatus(paymentStatus));
        }

        if (userId != null) {
            spec = spec.and(OrderSpecification.byUserId(userId));
        }

        return orderRepository.findAll(spec, pageable)
                .map(this::mapToOrderResponseDTO);
    }

    /**
     * get particular order details
     * @param orderId
     * @return
     */
    @Override
    public OrderResponseDTO getOrderDetails(Long orderId) {
        log.info("Fetching order details for ID: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        return mapToOrderResponseDTO(order);
    }

    /**
     * get single user's orders
     * @param userId
     * @param status
     * @param pageable
     * @return
     */
    @Override
    public Page<OrderResponseDTO> getUserOrders(Long userId, String status, Pageable pageable) {
        log.info("Fetching orders for user ID: {}, status: {}", userId, status);

        Specification<Order> spec = OrderSpecification.bySellerId(userId);

        if (StringUtils.hasText(status)) {
            spec = spec.and(OrderSpecification.byStatus(OrderStatus.valueOf(status)));
        }

        return orderRepository.findAll(spec, pageable)
                .map(this::mapToOrderResponseDTO);
    }

    /**
     * helper method for finding total amount according to filter
     * @param status
     * @param startDate
     * @param endDate
     * @return
     */
    private BigDecimal getTotalAmountByStatusAndDate(PaymentStatus status, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            return BigDecimal.ZERO;
        }

        Specification<PaymentTransaction> spec = PaymentTransactionSpecification.byStatus(status)
                .and(PaymentTransactionSpecification.byDateRange(startDate, endDate));

        List<PaymentTransaction> transactions = paymentTransactionRepository.findAll(spec);
        if (transactions == null || transactions.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return transactions.stream()
                .map(PaymentTransaction::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private AdminUserDTO mapToAdminUserDTO(User user) {
        String businessName = null;
        String shopName = null;
        String region = null;
        Long profileId = null;

        if ("WHOLESALER".equals(user.getRole().name())) {
            Optional<Wholesaler> wholesaler = wholesalerRepository.findByUserId(user.getId());
            if (wholesaler.isPresent()) {
                profileId = wholesaler.get().getId();
                businessName = wholesaler.get().getBusinessName();
            }
        } else if ("LOCAL_SELLER".equals(user.getRole().name())) {
            Optional<LocalSeller> seller = localSellerRepository.findByUserId(user.getId());
            if (seller.isPresent()) {
                profileId = seller.get().getId();
                shopName = seller.get().getShopName();
            }
        } else if ("SALESMAN".equals(user.getRole().name())) {
            Optional<Salesman> salesman = salesmanRepository.findByUserId(user.getId());
            if (salesman.isPresent()) {
                profileId = salesman.get().getId();
                region = salesman.get().getRegion();
            }
        }

        return AdminUserDTO.builder()
                .id(user.getId())
                .profileId(profileId)
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt().toLocalDateTime())
                .businessName(businessName)
                .shopName(shopName)
                .region(region)
                .build();
    }

    private PaymentTransactionDTO mapToPaymentTransactionDTO(PaymentTransaction transaction) {
        return PaymentTransactionDTO.builder()
                .id(transaction.getId())
                .orderId(transaction.getOrder().getId())
                .orderNumber(transaction.getOrder().getOrderNumber())
                .razorpayOrderId(transaction.getRazorpayOrderId())
                .razorpayPaymentId(transaction.getRazorpayPaymentId())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .status(transaction.getStatus() != null ? transaction.getStatus().name() : null)
                .paymentMethod(transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().name() : null)
                .createdAt(transaction.getCreatedAt())
                .paidAt(transaction.getPaidAt())
                .isRefunded(transaction.getRefundId() != null)
                .refundAmount(transaction.getRefundAmount())
                .failureReason(transaction.getFailureReason())
                .build();
    }

    private OrderItemDTO mapToOrderItemDTO(OrderItem item) {
        return OrderItemDTO.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName() != null ? item.getProductName() : item.getProduct().getName())
                .productSku(item.getProductSku() != null ? item.getProductSku() : item.getProduct().getSkuCode())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .total(item.getTotal())
                .build();
    }

    private OrderResponseDTO mapToOrderResponseDTO(Order order) {
        return OrderResponseDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .sellerId(order.getSeller().getId())
                .sellerName(order.getSeller().getUser().getUsername())
                .sellerShopName(order.getSeller().getShopName())
                .wholesalerId(order.getWholesaler().getId())
                .wholesalerName(order.getWholesaler().getBusinessName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .orderDate(order.getCreatedAt())
                .deliveryAddress(order.getDeliveryAddress())
                .items(order.getItems().stream().map(this::mapToOrderItemDTO).collect(Collectors.toList()))
                .build();
    }
}
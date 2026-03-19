package com.rms.service;

import com.rms.dto.*;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.*;
import com.rms.repository.*;
import com.rms.specification.OrderSpecification;
import com.rms.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static com.rms.constants.Constants.*;
import static com.rms.constants.Messages.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WholesalerOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final WholesalerRepository wholesalerRepository;
    private final ProductRepository productRepository;
    private final LocalSellerRepository sellerRepository;
    private final ModelMapper modelMapper;

    /**
     * Get all orders for a wholesaler with optional status filter
     * @param wholesalerId
     * @param status
     * @param pageable
     * @return
     */
    public Page<OrderResponseDTO> getOrders(Long wholesalerId, String status, Pageable pageable) {
        log.info("Getting orders for wholesaler: {}, status: {}", wholesalerId, status);

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        WHOLESALER_NOT_FOUND + wholesalerId
                ));

        Specification<Order> spec = Specification.where(OrderSpecification.byWholesalerId(wholesaler.getId()));

        if (status != null && !status.isEmpty()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                spec = spec.and(OrderSpecification.byStatus(orderStatus));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status: {}", status);
            }
        }

        Page<Order> orders = orderRepository.findAll(spec, pageable);

        // Load items for each order
        orders.forEach(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            order.setItems(items);
        });

        return orders.map(this::mapToDTO);
    }

    /**
     * Get only pending orders
     * @param wholesalerId
     * @param pageable
     * @return
     */
    public Page<OrderResponseDTO> getPendingOrders(Long wholesalerId, Pageable pageable) {
        return getOrders(wholesalerId, String.valueOf(OrderStatus.PENDING), pageable);
    }


    /**
     * Get single order details
     * @param wholesalerId
     * @param orderId
     * @return
     */
    public OrderResponseDTO getOrderDetails(Long wholesalerId, Long orderId) {
        log.info("Getting order {} for wholesaler {}", orderId, wholesalerId);

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        WHOLESALER_NOT_FOUND + wholesalerId
                ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ORDER_NOT_FOUND + orderId
                ));

        if (!order.getWholesaler().getId().equals(wholesaler.getId())) {
            throw new ResourceNotFoundException(ORDER_NOT_BELONG_TO_WHOLESALER);
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        order.setItems(items);

        return mapToDTO(order);
    }


    /**
     * Approve order
     * @param wholesalerId
     * @param orderId
     * @return
     */
    @Transactional
    public OrderApprovalDTO approveOrder(Long wholesalerId, Long orderId) {
        log.info("Approving order {} for wholesaler {}", orderId, wholesalerId);

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        WHOLESALER_NOT_FOUND + wholesalerId
                ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ORDER_NOT_FOUND + orderId
                ));

        if (!order.getWholesaler().getId().equals(wholesaler.getId())) {
            throw new ResourceNotFoundException(ORDER_NOT_BELONG_TO_WHOLESALER);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException(
                    ONLY_PENDING_ORDERS_CAN_APPROVE + order.getStatus()
            );
        }

        order.setStatus(OrderStatus.APPROVED);
        order.setApprovedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        log.info("Order {} approved successfully", orderId);

        return OrderApprovalDTO.builder()
                .orderId(savedOrder.getId())
                .orderNumber(savedOrder.getOrderNumber())
                .status(savedOrder.getStatus().toString())
                .approvedAt(savedOrder.getApprovedAt())
                .approvedBy(wholesaler.getBusinessName())
                .message(ORDER_APPROVED)
                .build();
    }

    /**
     * Reject order with reason
     * @param wholesalerId
     * @param orderId
     * @param rejectionDTO
     * @return
     */
    @Transactional
    public OrderResponseDTO rejectOrder(Long wholesalerId, Long orderId, RejectionDTO rejectionDTO) {
        log.info("Rejecting order {} for wholesaler {}, reason: {}",
                orderId, wholesalerId, rejectionDTO.getReason());

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        WHOLESALER_NOT_FOUND + wholesalerId
                ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ORDER_NOT_FOUND + orderId
                ));

        if (!order.getWholesaler().getId().equals(wholesaler.getId())) {
            throw new ResourceNotFoundException(ORDER_NOT_BELONG_TO_WHOLESALER);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException(
                    ONLY_PENDING_ORDERS_CAN_REJECT + order.getStatus()
            );
        }

        // Load items to restore stock
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        // Restore stock for each item
        for (OrderItem item : items) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
            log.info("Restored stock for product {}: +{}", product.getId(), item.getQuantity());
        }

        // Update order status
        order.setStatus(OrderStatus.REJECTED);

        Order savedOrder = orderRepository.save(order);
        List<OrderItem> refreshedItems = orderItemRepository.findByOrderId(savedOrder.getId());
        savedOrder.getItems().clear();
        savedOrder.getItems().addAll(refreshedItems);

        return mapToDTO(savedOrder);
    }

    /**
     * Update order status
     * @param wholesalerId
     * @param orderId
     * @param statusUpdate
     * @return
     */
    @Transactional
    public OrderResponseDTO updateOrderStatus(Long wholesalerId, Long orderId, StatusUpdateDTO statusUpdate) {
        log.info("Updating order {} to status {} for wholesaler {}",
                orderId, statusUpdate.getStatus(), wholesalerId);

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        WHOLESALER_NOT_FOUND + wholesalerId
                ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ORDER_NOT_FOUND + orderId
                ));

        if (!order.getWholesaler().getId().equals(wholesaler.getId())) {
            throw new ResourceNotFoundException(ORDER_NOT_BELONG_TO_WHOLESALER);
        }

        OrderStatus status;
        try {
            status = OrderStatus.valueOf(statusUpdate.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(INVALID_STATUS + statusUpdate.getStatus());
        }

        // Check valid status transitions
        if (!isValidStatusTransition(order.getStatus(), status)) {
            throw new IllegalStateException(
                    "Cannot transition from " + order.getStatus() + " to " + status
            );
        }

        order.setStatus(status);

        // Set timestamps based on status
        if (status == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }

//        // Handle shipping tracking
//        if (status == OrderStatus.SHIPPED && statusUpdate.getTrackingNumber() != null) {
//            //done whene selsman module impl
//        }

        Order savedOrder = orderRepository.save(order);

        // Load items
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        savedOrder.getItems().clear();
        savedOrder.getItems().addAll(items);

        log.info("Order {} status updated to {}", orderId, status);

        return mapToDTO(savedOrder);
    }

    /**
     * Get dashboard statistics
     * @param wholesalerId
     * @return
     */
    public WholesalerStatsDTO getStatistics(Long wholesalerId) {
        log.info("Getting statistics for wholesaler: {}", wholesalerId);

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        WHOLESALER_NOT_FOUND + wholesalerId
                ));

        Specification<Order> baseSpec = OrderSpecification.byWholesalerId(wholesaler.getId());

        // Order counts by status
        Long totalOrders = orderRepository.count(baseSpec);
        Long pendingOrders = orderRepository.count(baseSpec.and(OrderSpecification.byStatus(OrderStatus.PENDING)));
        Long approvedOrders = orderRepository.count(baseSpec.and(OrderSpecification.byStatus(OrderStatus.APPROVED)));
        Long processingOrders = orderRepository.count(baseSpec.and(OrderSpecification.byStatus(OrderStatus.PROCESSING)));
        Long shippedOrders = orderRepository.count(baseSpec.and(OrderSpecification.byStatus(OrderStatus.SHIPPED)));
        Long deliveredOrders = orderRepository.count(baseSpec.and(OrderSpecification.byStatus(OrderStatus.DELIVERED)));
        Long rejectedOrders = orderRepository.count(baseSpec.and(OrderSpecification.byStatus(OrderStatus.REJECTED)));
        Long cancelledOrders = orderRepository.count(baseSpec.and(OrderSpecification.byStatus(OrderStatus.CANCELLED)));

        // Calculate revenue
        BigDecimal totalRevenue = calculateRevenue(wholesaler.getId(), null, null);
        BigDecimal todayRevenue = calculateRevenue(wholesaler.getId(),
                LocalDate.now().atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX));
        BigDecimal thisWeekRevenue = calculateRevenue(wholesaler.getId(),
                LocalDate.now().minusDays(7).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX));
        BigDecimal thisMonthRevenue = calculateRevenue(wholesaler.getId(),
                LocalDate.now().withDayOfMonth(1).atStartOfDay(),
                LocalDate.now().atTime(LocalTime.MAX));

        // Average order value
        BigDecimal averageOrderValue = deliveredOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(deliveredOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Get unique sellers
        List<Order> allOrders = orderRepository.findAll(baseSpec);
        Set<Long> sellerIds = allOrders.stream()
                .map(o -> o.getSeller().getId())
                .collect(Collectors.toSet());

        Long totalSellers = (long) sellerIds.size();

        // Get active sellers (with orders in last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long activeSellers = allOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(thirtyDaysAgo))
                .map(o -> o.getSeller().getId())
                .distinct()
                .count();

        // Get product statistics
        Long totalProducts = productRepository.count(
                ProductSpecification.byWholesalerId(wholesalerId)
        );

        Long lowStockProducts = productRepository.count(
                ProductSpecification.byWholesalerId(wholesalerId)
                        .and(ProductSpecification.lowStock(10))
        );

        Long outOfStockProducts = productRepository.count(
                ProductSpecification.byWholesalerId(wholesalerId)
                        .and(ProductSpecification.outOfStock())
        );
        // Get top sellers
        List<TopSellerDTO> topSellers = getTopSellers(wholesaler.getId());

        // Get recent orders preview
        List<OrderPreviewDTO> recentOrders = getRecentOrdersPreview(wholesaler.getId(), 5);

        // Prepare chart data
        Map<String, Long> ordersByStatusChart = new LinkedHashMap<>();
        ordersByStatusChart.put(String.valueOf(OrderStatus.PENDING), pendingOrders);
        ordersByStatusChart.put(String.valueOf(OrderStatus.APPROVED), approvedOrders);
        ordersByStatusChart.put(String.valueOf(OrderStatus.PROCESSING), processingOrders);
        ordersByStatusChart.put(String.valueOf(OrderStatus.SHIPPED), shippedOrders);
        ordersByStatusChart.put(String.valueOf(OrderStatus.DELIVERED), deliveredOrders);

        // Revenue by day for last 7 days
        Map<String, BigDecimal> revenueByDay = getRevenueByDay(wholesaler.getId(), 7);

        return WholesalerStatsDTO.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .approvedOrders(approvedOrders)
                .processingOrders(processingOrders)
                .shippedOrders(shippedOrders)
                .deliveredOrders(deliveredOrders)
                .rejectedOrders(rejectedOrders)
                .cancelledOrders(cancelledOrders)
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .thisWeekRevenue(thisWeekRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .averageOrderValue(averageOrderValue)
                .totalSellers(totalSellers)
                .activeSellers(activeSellers)
                .totalProducts(totalProducts)
                .lowStockProducts(lowStockProducts)
                .outOfStockProducts(outOfStockProducts)
                .topSellers(topSellers)
                .recentOrders(recentOrders)
                .ordersByStatusChart(ordersByStatusChart)
                .revenueByDay(revenueByDay)
                .build();
    }

    /**
     * Get recent orders preview
     * @param wholesalerId
     * @param limit
     * @return
     */
    public RecentOrdersDTO getRecentOrders(Long wholesalerId, int limit) {
        log.info("Getting recent {} orders for wholesaler: {}", limit, wholesalerId);

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        WHOLESALER_NOT_FOUND + wholesalerId
                ));

        Specification<Order> spec = OrderSpecification.byWholesalerId(wholesaler.getId());
        Pageable topN = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, CREATED_AT));

        Page<Order> orders = orderRepository.findAll(spec, topN);

        List<OrderPreviewDTO> previewDTOs = orders.getContent().stream()
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    return OrderPreviewDTO.builder()
                            .orderId(order.getId())
                            .orderNumber(order.getOrderNumber())
                            .sellerName(order.getSeller().getUser().getUsername())
                            .sellerShop(order.getSeller().getShopName())
                            .totalAmount(order.getTotalAmount())
                            .status(order.getStatus().toString())
                            .orderDate(order.getCreatedAt())
                            .itemCount(items.size())
                            .build();
                })
                .collect(Collectors.toList());

        // Count pending, processing, shipped
        long pendingCount = orderRepository.count(spec.and(OrderSpecification.byStatus(OrderStatus.PENDING)));
        long processingCount = orderRepository.count(spec.and(OrderSpecification.byStatus(OrderStatus.PROCESSING)));
        long shippedCount = orderRepository.count(spec.and(OrderSpecification.byStatus(OrderStatus.SHIPPED)));

        return RecentOrdersDTO.builder()
                .orders(previewDTOs)
                .totalRecent((long) previewDTOs.size())
                .pendingCount(pendingCount)
                .processingCount(processingCount)
                .shippedCount(shippedCount)
                .build();
    }


    /**
     * helper method
     * for calculete revenue
     * @param wholesalerId
     * @param startDate
     * @param endDate
     * @return
     */
    private BigDecimal calculateRevenue(Long wholesalerId, LocalDateTime startDate, LocalDateTime endDate) {
        Specification<Order> spec = Specification
                .where(OrderSpecification.byWholesalerId(wholesalerId))
                .and(OrderSpecification.byStatus(OrderStatus.DELIVERED));

        if (startDate != null && endDate != null) {
            spec = spec.and(OrderSpecification.byDateRange(startDate, endDate));
        }

        List<Order> deliveredOrders = orderRepository.findAll(spec);

        return deliveredOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * helper method
     * get revenur by day wise
     * @param wholesalerId
     * @param days
     * @return
     */
    private Map<String, BigDecimal> getRevenueByDay(Long wholesalerId, int days) {
        Map<String, BigDecimal> revenueByDay = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);

            BigDecimal revenue = calculateRevenue(wholesalerId, start, end);
            revenueByDay.put(date.format(DateTimeFormatter.ISO_LOCAL_DATE), revenue);
        }

        return revenueByDay;
    }

    /**
     * helper method for finding top sellers
     * @param wholesalerId
     * @return
     */
    private List<TopSellerDTO> getTopSellers(Long wholesalerId) {
        // This is a simplified version - you might want to optimize with a native query
        Specification<Order> spec = OrderSpecification.byWholesalerId(wholesalerId)
                .and(OrderSpecification.byStatus(OrderStatus.DELIVERED));

        List<Order> deliveredOrders = orderRepository.findAll(spec);

        Map<Long, List<Order>> ordersBySeller = deliveredOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getSeller().getId()));

        return ordersBySeller.entrySet().stream()
                .map(entry -> {
                    Long sellerId = entry.getKey();
                    List<Order> sellerOrders = entry.getValue();

                    LocalSeller seller = sellerRepository.findById(sellerId).orElse(null);
                    if (seller == null) return null;

                    long orderCount = sellerOrders.size();
                    BigDecimal totalSpent = sellerOrders.stream()
                            .map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return TopSellerDTO.builder()
                            .sellerId(sellerId)
                            .shopName(seller.getShopName())
                            .ownerName(seller.getUser().getUsername())
                            .phone(seller.getUser().getPhone())
                            .orderCount(orderCount)
                            .totalSpent(totalSpent)
                            .averageOrderValue(orderCount > 0
                                    ? totalSpent.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP)
                                    : BigDecimal.ZERO)
                            .build();
                })
                .filter(Objects::nonNull)
                .sorted((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent()))
                .limit(5)
                .collect(Collectors.toList());
    }

    /**
     * helper method for geting recent order preview
     * @param wholesalerId
     * @param limit
     * @return
     */
    private List<OrderPreviewDTO> getRecentOrdersPreview(Long wholesalerId, int limit) {
        Specification<Order> spec = OrderSpecification.byWholesalerId(wholesalerId);
        Pageable topN = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, CREATED_AT));

        return orderRepository.findAll(spec, topN).stream()
                .map(order -> OrderPreviewDTO.builder()
                        .orderId(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .sellerName(order.getSeller().getUser().getUsername())
                        .sellerShop(order.getSeller().getShopName())
                        .totalAmount(order.getTotalAmount())
                        .status(order.getStatus().toString())
                        .orderDate(order.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }


    private boolean isValidStatusTransition(OrderStatus current, OrderStatus next) {
        return switch (current) {
            case PENDING -> next == OrderStatus.APPROVED || next == OrderStatus.REJECTED;
            case APPROVED -> next == OrderStatus.PROCESSING || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED || next == OrderStatus.CANCELLED;
            default -> false;
        };
    }


    private OrderResponseDTO mapToDTO(Order order) {
        OrderResponseDTO dto = modelMapper.map(order, OrderResponseDTO.class);

        dto.setSellerId(order.getSeller().getId());
        dto.setSellerName(order.getSeller().getUser().getUsername());
        dto.setSellerShopName(order.getSeller().getShopName());
        dto.setWholesalerId(order.getWholesaler().getId());
        dto.setWholesalerName(order.getWholesaler().getBusinessName());
        dto.setOrderDate(order.getCreatedAt());

        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .map(this::mapItemToDTO)
                .collect(Collectors.toList());
        dto.setItems(itemDTOs);

        return dto;
    }

    private OrderItemDTO mapItemToDTO(OrderItem item) {
        OrderItemDTO dto = modelMapper.map(item, OrderItemDTO.class);
        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());
        }
        return dto;
    }
}
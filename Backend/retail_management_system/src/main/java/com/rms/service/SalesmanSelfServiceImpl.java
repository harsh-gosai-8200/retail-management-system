package com.rms.service;

import com.rms.dto.*;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.*;
import com.rms.model.enums.OrderStatus;
import com.rms.repository.*;
import com.rms.specification.SalesmanAssignmentSpecification;
import com.rms.specification.SalesmanOrderSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.util.List;
import java.util.stream.Collectors;

import static com.rms.constants.Messages.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SalesmanSelfServiceImpl implements SalesmanSelfService {

    private final SalesmanRepository salesmanRepository;
    private final SalesmanAssignmentRepository assignmentRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final InvoiceService invoiceService;

    /**
     * Fetch salesman profile data to show on profile
     * @param salesmanId
     * @return
     */
    @Override
    public SalesmanProfileDTO getMyProfile(Long salesmanId) {
        log.info("Fetching profile for salesman ID: {}", salesmanId);

        Salesman salesman = salesmanRepository.findById(salesmanId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        SALESMAN_NOT_FOUND + salesmanId
                ));

        Long assignedCount = assignmentRepository.count(
                Specification.where(SalesmanAssignmentSpecification.bySalesmanId(salesmanId))
                        .and(SalesmanAssignmentSpecification.activeOnly())
        );

        return SalesmanProfileDTO.builder()
                .id(salesman.getId())
                .fullName(salesman.getFullName())
                .email(salesman.getUser().getEmail())
                .phone(salesman.getUser().getPhone())
                .employeeId(salesman.getEmployeeId())
                .region(salesman.getRegion())
                .department(salesman.getDepartment())
                .commissionRate(salesman.getCommissionRate())
                .salary(salesman.getSalary())
                .wholesalerName(salesman.getWholesaler().getBusinessName())
                .wholesalerAddress(salesman.getWholesaler().getAddress())
                .wholesalerPhone(salesman.getWholesaler().getUser().getPhone())
                .assignedSellersCount(assignedCount)
                .status(salesman.getUser().getIsActive() ? "ACTIVE" : "INACTIVE")
                .build();
    }

    /**
     * Update profile data for salesman side
     * @param salesmanId
     * @param updateDTO
     * @return
     */
    @Override
    public SalesmanProfileDTO updateMyProfile(Long salesmanId, SalesmanProfileUpdateDTO updateDTO) {
        log.info("Updating profile for salesman ID: {}", salesmanId);

        Salesman salesman = salesmanRepository.findById(salesmanId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        SELLER_NOT_FOUND + salesmanId
                ));

        if (updateDTO.getFullName() != null) {
            salesman.setFullName(updateDTO.getFullName());
            salesman.getUser().setUsername(updateDTO.getFullName());
        }

        if (updateDTO.getPhone() != null) {
            salesman.getUser().setPhone(updateDTO.getPhone());
        }

        if (updateDTO.getEmergencyContact() != null) {
            salesman.setEmergencyContact(updateDTO.getEmergencyContact());
        }

        if (updateDTO.getEmergencyContactName() != null) {
            salesman.setEmergencyContactName(updateDTO.getEmergencyContactName());
        }

        salesmanRepository.save(salesman);

        return getMyProfile(salesmanId);
    }

    /**
     * fetching all localseller and its data assign to salesman
     * @param salesmanId
     * @return
     */
    @Override
    public List<AssignedSellerDTO> getMyAssignedSellers(Long salesmanId) {
        log.info("Fetching assigned sellers for salesman ID: {}", salesmanId);

        Specification<SalesmanAssignment> spec =
                Specification.where(SalesmanAssignmentSpecification.bySalesmanId(salesmanId))
                        .and(SalesmanAssignmentSpecification.activeOnly());

        List<SalesmanAssignment> assignments = assignmentRepository.findAll(spec);

        return assignments.stream()
                .map(assignment -> {
                    LocalSeller seller = assignment.getSeller();

                    Long pendingOrders = orderRepository.count(
                            Specification.where(SalesmanOrderSpecification.bySellerId(seller.getId()))
                                    .and(SalesmanOrderSpecification.byStatusIn(
                                            List.of("APPROVED", "PROCESSING", "SHIPPED")))
                    );

                    Long totalOrders = orderRepository.count(
                            SalesmanOrderSpecification.bySellerId(seller.getId())
                    );

                    String lastOrderDate = getLastOrderDate(seller.getId());

                    return AssignedSellerDTO.builder()
                            .sellerId(seller.getId())
                            .shopName(seller.getShopName())
                            .ownerName(seller.getUser().getUsername())
                            .phone(seller.getUser().getPhone())
                            .address(seller.getAddress())
                            .pendingOrders(pendingOrders)
                            .totalOrders(totalOrders)
                            .lastOrderDate(lastOrderDate)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * fetching all localseller's order assign to salesman
     * @param salesmanId
     * @param status
     * @param pageable
     * @return
     */
    @Override
    public PaginatedResponseDTO<SalesmanOrderDTO> getOrdersFromMySellers(
            Long salesmanId, String status, Pageable pageable) {

        log.info("Fetching orders for salesman ID: {}, status: {}", salesmanId, status);

        List<Long> sellerIds = getAssignedSellerIds(salesmanId);

        if (sellerIds.isEmpty()) {
            return PaginatedResponseDTO.<SalesmanOrderDTO>builder()
                    .content(List.of())
                    .currentPage(0)
                    .totalItems(0)
                    .totalPages(0)
                    .pageSize(pageable.getPageSize())
                    .last(true)
                    .build();
        }

        Specification<Order> spec = SalesmanOrderSpecification.withFilters(
                sellerIds, status, null, null
        );

        Page<Order> page = orderRepository.findAll(spec, pageable);

        List<SalesmanOrderDTO> content = page.getContent().stream()
                .map(order -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
                    order.getItems().clear();
                    order.getItems().addAll(items);
                    return mapToSalesmanOrderDTO(order);
                })
                .collect(Collectors.toList());

        return PaginatedResponseDTO.<SalesmanOrderDTO>builder()
                .content(content)
                .currentPage(page.getNumber())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .pageSize(page.getSize())
                .last(page.isLast())
                .build();
    }

    /**
     * get perticuler order details
     * @param salesmanId
     * @param orderId
     * @return
     */
    @Override
    public SalesmanOrderDTO getOrderDetails(Long salesmanId, Long orderId) {
        log.info("Fetching order details for salesman ID: {}, order ID: {}", salesmanId, orderId);

        List<Long> sellerIds = getAssignedSellerIds(salesmanId);

        if (sellerIds.isEmpty()) {
            throw new ResourceNotFoundException(NO_ASSIGN_SELLER_FOUND);
        }

        Specification<Order> spec =
                Specification.where(SalesmanOrderSpecification.bySellerIds(sellerIds))
                        .and((root, query, cb) -> cb.equal(root.get("id"), orderId));

        Order order = orderRepository.findOne(spec)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(ORDER_NOT_FOUND, orderId)
                ));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        order.getItems().clear();
        order.getItems().addAll(items);

        return mapToSalesmanOrderDTO(order);
    }

    /**
     * mark order as deliver for delivery only
     * @param salesmanId
     * @param orderId
     * @param deliveryDTO
     * @return
     */
    @Override
    public DeliveryResponseDTO markOrderAsDelivered(
            Long salesmanId, Long orderId, DeliveryUpdateDTO deliveryDTO) {

        log.info("Marking order {} as delivered by salesman ID: {}", orderId, salesmanId);

        List<Long> sellerIds = getAssignedSellerIds(salesmanId);

        if (sellerIds.isEmpty()) {
            throw new IllegalArgumentException(NO_ASSIGN_SELLER_FOUND);
        }

        Specification<Order> spec =
                Specification.where(SalesmanOrderSpecification.bySellerIds(sellerIds))
                        .and((root, query, cb) -> cb.equal(root.get("id"), orderId))
                        .and((root, query, cb) -> cb.equal(root.get("status"), OrderStatus.SHIPPED));

        Order order = orderRepository.findOne(spec)
                .orElseThrow(() -> new IllegalArgumentException(
                        ORDER_NOT_FOUND_ONLY_SHIPPED_ORDER_MARD_DELIVERED
                ));

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());

        orderRepository.save(order);

        invoiceService.generateAndSendInvoice(orderId);

        return DeliveryResponseDTO.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(String.valueOf(OrderStatus.DELIVERED))
                .deliveredAt(order.getDeliveredAt())
                .receiverName(deliveryDTO.getReceiverName())
                .receiverPhone(deliveryDTO.getReceiverPhone())
                .deliveryPhoto(deliveryDTO.getDeliveryPhoto())
                .notes(deliveryDTO.getNotes())
                .message(ORDER_MARK_DELIVERED)
                .build();
    }

    /**
     * if order not delivered and any issue created update delivery status
     * @param salesmanId
     * @param orderId
     * @param status
     * @param notes
     * @return
     */
    @Override
    public DeliveryResponseDTO updateDeliveryStatus(Long salesmanId, Long orderId, String status, String notes) {
        log.info("Updating delivery status for order: {} to status: {} by salesman: {}",
                orderId, status, salesmanId);

        if (!List.of(OrderStatus.PARTIALLY_DELIVERED, OrderStatus.FAILED, OrderStatus.RETURNED).contains(status)) {
            throw new IllegalArgumentException(INVALID_DELIVERY_STATUS + status);
        }

        List<Long> sellerIds = getAssignedSellerIds(salesmanId);

        if (sellerIds.isEmpty()) {
            throw new IllegalArgumentException(NO_ASSIGN_SELLER_FOUND);
        }

        Specification<Order> spec =
                Specification.where(SalesmanOrderSpecification.bySellerIds(sellerIds))
                        .and((root, query, cb) -> cb.equal(root.get("id"), orderId))
                        .and((root, query, cb) ->
                                cb.or(
                                        cb.equal(root.get("status"), OrderStatus.SHIPPED),
                                        cb.equal(root.get("status"), OrderStatus.PROCESSING)
                                ));

        Order order = orderRepository.findOne(spec)
                .orElseThrow(() -> new IllegalArgumentException(
                        ORDER_NOT_FOUND_ONLY_SHIPPED_AND_PROCESSING_ORDER_UPDATE
                ));

        OrderStatus newStatus;
        switch (status) {
            case "PARTIALLY_DELIVERED":
                newStatus = OrderStatus.PARTIALLY_DELIVERED;
                break;
            case "FAILED":
                newStatus = OrderStatus.FAILED;
                break;
            case "RETURNED":
                newStatus = OrderStatus.RETURNED;
                break;
            default:
                throw new IllegalArgumentException("Unsupported status: " + status);
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        log.info("Order {} status updated to {}", orderId, status);

        return DeliveryResponseDTO.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(status)
                .deliveredAt(order.getDeliveredAt())
                .notes(notes)
                .message(UPDATE_DELIVERY_STATUS + status)
                .build();
    }

    /**
     * fetch all data and statistics for salesman dashboard
     * @param salesmanId
     * @return
     */
    @Override
    public SalesmanDashboardDTO getMyDashboardStats(Long salesmanId) {
        log.info("Fetching dashboard stats for salesman ID: {}", salesmanId);

        List<Long> sellerIds = getAssignedSellerIds(salesmanId);

        long totalAssigned = sellerIds.size();
        long pendingDeliveries = 0;
        long completedToday = 0;
        long totalCompleted = 0;
        BigDecimal totalCollection = BigDecimal.ZERO;

        if (!sellerIds.isEmpty()) {
            pendingDeliveries = orderRepository.count(
                    Specification.where(SalesmanOrderSpecification.bySellerIds(sellerIds))
                            .and(SalesmanOrderSpecification.pendingForDelivery())
            );

            completedToday = orderRepository.count(
                    Specification.where(SalesmanOrderSpecification.bySellerIds(sellerIds))
                            .and(SalesmanOrderSpecification.deliveredOn(LocalDate.now()))
            );

            totalCompleted = orderRepository.count(
                    Specification.where(SalesmanOrderSpecification.bySellerIds(sellerIds))
                            .and(SalesmanOrderSpecification.byStatus("DELIVERED"))
            );

            List<Order> deliveredOrders = orderRepository.findAll(
                    Specification.where(SalesmanOrderSpecification.bySellerIds(sellerIds))
                            .and(SalesmanOrderSpecification.byStatus("DELIVERED"))
            );

            totalCollection = deliveredOrders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        Salesman salesman = salesmanRepository.findById(salesmanId)
                .orElseThrow(() -> new ResourceNotFoundException(SALESMAN_NOT_FOUND + salesmanId));

        BigDecimal estimatedCommission = totalCollection
                .multiply(BigDecimal.valueOf(salesman.getCommissionRate() != null ?
                        salesman.getCommissionRate() / 100 : 0))
                .setScale(2, RoundingMode.HALF_UP);

        List<AssignedSellerDTO> recentSellers = getMyAssignedSellers(salesmanId)
                .stream().limit(5).collect(Collectors.toList());

        return SalesmanDashboardDTO.builder()
                .totalAssignedSellers(totalAssigned)
                .pendingDeliveries(pendingDeliveries)
                .completedToday(completedToday)
                .totalCompleted(totalCompleted)
                .totalCollection(totalCollection)
                .estimatedCommission(estimatedCommission)
                .recentSellers(recentSellers)
                .build();
    }

    /**
     * fetching all orders for perticuler seller assign to salesman
     * @param salesmanId
     * @param sellerId
     * @param status
     * @return
     */
    @Override
    public List<SalesmanOrderDTO> getSellerOrders(Long salesmanId, Long sellerId, String status) {
        log.info("Getting orders for salesman: {}, seller: {}, status: {}", salesmanId, sellerId, status);

        boolean isAssigned = assignmentRepository.exists(
                Specification.where(SalesmanAssignmentSpecification.bySalesmanId(salesmanId))
                        .and(SalesmanAssignmentSpecification.bySellerId(sellerId))
                        .and(SalesmanAssignmentSpecification.activeOnly())
        );

        if (!isAssigned) {
            throw new IllegalArgumentException(NO_ASSIGN_SELLER_FOUND);
        }

        Specification<Order> spec = SalesmanOrderSpecification.bySellerId(sellerId);

        if (status != null) {
            spec = spec.and(SalesmanOrderSpecification.byStatus(status));
        }

        List<Order> orders = orderRepository.findAll(spec);

        return orders.stream()
                .map(this::mapToSalesmanOrderDTO)
                .collect(Collectors.toList());
    }

    /**
     * Helper method for find all assign seller ids
     * @param salesmanId
     * @return
     */
    private List<Long> getAssignedSellerIds(Long salesmanId) {
        Specification<SalesmanAssignment> spec =
                Specification.where(SalesmanAssignmentSpecification.bySalesmanId(salesmanId))
                        .and(SalesmanAssignmentSpecification.activeOnly());

        return assignmentRepository.findAll(spec)
                .stream()
                .map(a -> a.getSeller().getId())
                .collect(Collectors.toList());
    }

    /**
     * Helper method for finding last order date for salesman to show assign localseller last order date
     * @param sellerId
     * @return
     */
    private String getLastOrderDate(Long sellerId) {
        Pageable topOne = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Order> spec = SalesmanOrderSpecification.bySellerId(sellerId);

        return orderRepository.findAll(spec, topOne)
                .stream()
                .findFirst()
                .map(order -> order.getCreatedAt().toLocalDate().toString())
                .orElse("No orders");
    }

    private SalesmanOrderDTO mapToSalesmanOrderDTO(Order order) {
        List<SalesmanOrderItemDTO> items = order.getItems().stream()
                .map(item -> SalesmanOrderItemDTO.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProductName() != null ?
                                item.getProductName() : item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .total(item.getTotal())
                        .build())
                .collect(Collectors.toList());

        return SalesmanOrderDTO.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .sellerId(order.getSeller().getId())
                .sellerName(order.getSeller().getUser().getUsername())
                .sellerShop(order.getSeller().getShopName())
                .sellerPhone(order.getSeller().getUser().getPhone())
                .sellerAddress(order.getSeller().getAddress())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().toString())
                .orderDate(order.getCreatedAt())
                .deliveryAddress(order.getDeliveryAddress())
                .itemCount(order.getItems().size())
                .items(items)
                .build();
    }
}

package com.rms.service;

import com.rms.dto.*;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.OrderStatus;
import com.rms.model.*;
import com.rms.repository.*;
import com.rms.specification.OrderSpecification;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final LocalSellerRepository localSellerRepository;
    private final WholesalerRepository wholesalerRepository;
    private final ModelMapper modelMapper;

    private static final BigDecimal TAX_RATE = new BigDecimal("0.05");

    /**
     * order place service
     * @param request
     * @return
     */
    @Transactional
    public OrderResponseDTO placeOrder(OrderRequestDTO request) {
        log.info("Placing order for seller: {}", request.getSellerId());

        LocalSeller seller = localSellerRepository.findById(request.getSellerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller not found with ID: " + request.getSellerId()
                ));

        Wholesaler wholesaler = wholesalerRepository.findById(request.getWholesalerId())
                .orElseThrow(() -> new ResourceNotFoundException("Wholesaler not found"));

        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemRequest -> createOrderItem(itemRequest, wholesaler))
                .collect(Collectors.toList());

        BigDecimal subtotal = orderItems.stream()
                .map(OrderItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax);

        // Create order using Builder pattern
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setSeller(seller);
        order.setWholesaler(wholesaler);
        order.setSubtotal(subtotal);
        order.setTaxAmount(tax);
        order.setTotalAmount(total);
        order.setTotalItems(orderItems.size());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setDeliveryAddress(request.getDeliveryAddress() != null ?
                request.getDeliveryAddress() : seller.getAddress());
        order.setDeliveryInstructions(request.getDeliveryInstructions());

        Order savedOrder = orderRepository.save(order);

        // Associate items with order
        orderItems.forEach(item -> {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);

            // Reduce stock
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        });

        // Clear from cart
        request.getItems().forEach(itemRequest ->
                cartItemRepository.findBySellerIdAndProductId(seller.getId(), itemRequest.getProductId())
                        .ifPresent(cartItemRepository::delete)
        );

        Order orderWithItems = orderRepository.findById(savedOrder.getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        log.info("Order after refresh has {} items", orderWithItems.getItems().size());

        log.info("Order placed successfully. Order Number: {}", savedOrder.getOrderNumber());

        return mapToDTO(savedOrder);
    }

    /**
     * Get seller orders
     * @param sellerId
     * @param status
     * @param pageable
     * @return
     */
    public Page<OrderResponseDTO> getSellerOrders(Long sellerId, String status, Pageable pageable) {
        LocalSeller seller = localSellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller not found with ID: " + sellerId
                ));

        Specification<Order> spec = Specification.where(OrderSpecification.bySellerId(seller.getId()));

        if (status != null && !status.isEmpty()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                spec = spec.and(OrderSpecification.byStatus(orderStatus));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status: {}", status);
            }
        }

        Page<Order> orders = orderRepository.findAll(spec, pageable);
        return orders.map(this::mapToDTO);
    }

    /**
     * Get order details
     * @param sellerId
     * @param orderId
     * @return
     */
    public OrderResponseDTO getOrderDetails(Long sellerId, Long orderId) {
        log.info("Getting order {} for seller {}", orderId, sellerId);
        LocalSeller seller = localSellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller not found with ID: " + sellerId
                ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with ID: " + orderId
                ));

        if (!order.getSeller().getId().equals(seller.getId())) {
            log.error("Order {} belongs to seller {}, not seller {}",
                    orderId, order.getSeller().getId(), sellerId);
            throw new ResourceNotFoundException(
                    "Order not found for seller: " + sellerId
            );
        }
        return mapToDTO(order);
    }

    /**
     * Cancel order
     * @param sellerId
     * @param orderId
     * @return
     */
    @Transactional
    public OrderResponseDTO cancelOrder(Long sellerId, Long orderId) {
        log.info("Cancelling order: {}", orderId);

        LocalSeller seller = localSellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller not found with ID: " + sellerId
                ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with ID: " + orderId
                ));

        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new ResourceNotFoundException("Order does not belong to this seller");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }

        // Restore stock
        order.getItems().forEach(item -> {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        });

        order.setStatus(OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);

        return mapToDTO(cancelledOrder);
    }

    /**
     * Get order summary
     * @param sellerId
     * @return
     */
    public OrderSummaryDTO getOrderSummary(Long sellerId) {
        LocalSeller seller = localSellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller not found with ID: " + sellerId
                ));

        long totalOrders = orderRepository.count(OrderSpecification.bySellerId(seller.getId()));
        long pendingOrders = orderRepository.count(
                OrderSpecification.bySellerId(seller.getId())
                        .and(OrderSpecification.byStatus(OrderStatus.PENDING)));
        long deliveredOrders = orderRepository.count(
                OrderSpecification.bySellerId(seller.getId())
                        .and(OrderSpecification.byStatus(OrderStatus.DELIVERED)));
        long cancelledOrders = orderRepository.count(
                OrderSpecification.bySellerId(seller.getId())
                        .and(OrderSpecification.byStatus(OrderStatus.CANCELLED)));

        BigDecimal totalSpent = orderRepository.getTotalSpentBySeller(seller.getId());

        return OrderSummaryDTO.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .totalSpent(totalSpent)
                .averageOrderValue(totalOrders > 0 ?
                        totalSpent.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) :
                        BigDecimal.ZERO)
                .build();
    }

    /**
     * Get recent orders (last 5 orders)
     * @param sellerId
     * @return
     */
    public List<OrderResponseDTO> getRecentOrders(Long sellerId) {
        log.info("Fetching recent orders for seller: {}", sellerId);

        LocalSeller seller = localSellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seller not found with ID: " + sellerId
                ));
        // Use Specification to get recent orders
        Specification<Order> spec = OrderSpecification.bySellerId(seller.getId());

        // Sort by createdAt descending and limit to 5
        Pageable topFive = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Order> orders = orderRepository.findAll(spec, topFive);

        return orders.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }


    /**
     * helper method for main services
     * @param itemRequest
     * @param wholesaler
     * @return
     */
    private OrderItem createOrderItem(OrderItemRequestDTO itemRequest, Wholesaler wholesaler) {
        Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getWholesaler().getId().equals(wholesaler.getId())) {
            throw new RuntimeException("Product does not belong to this wholesaler");
        }

        if (product.getStockQuantity() < itemRequest.getQuantity()) {
            throw new RuntimeException("Insufficient stock for " + product.getName());
        }

        OrderItem item = new OrderItem();
        item.setProduct(product);
        item.setQuantity(itemRequest.getQuantity());
        item.setPrice(product.getPrice());
        item.setTotal(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        item.setProductName(product.getName());
        item.setProductSku(product.getSkuCode());

        return item;
    }


    /**
     * helper method for main services
     * @return
     */
    private String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = orderRepository.count() + 1;
        String sequencePart = String.format("%05d", count);
        return "ORD-" + datePart + "-" + sequencePart;
    }

    /**
     * helper method for main services
     * mapping entity to dto
     * @param order
     * @return
     */
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

    /**
     * helper method for main services
     * @param item
     * @return
     */
    private OrderItemDTO mapItemToDTO(OrderItem item) {
        return modelMapper.map(item, OrderItemDTO.class);
    }
}
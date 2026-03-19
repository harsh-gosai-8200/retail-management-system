
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

import static com.rms.constants.Constants.*;
import static com.rms.constants.Messages.*;

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
        log.info("========== PLACING ORDER ==========");
        log.info("Seller ID: {}, Wholesaler ID: {}", request.getSellerId(), request.getWholesalerId());
        log.info("Items count: {}", request.getItems().size());

        // Get seller
        LocalSeller seller = localSellerRepository.findById(request.getSellerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        SELLER_NOT_FOUND + request.getSellerId()
                ));

        // Get wholesaler
        Wholesaler wholesaler = wholesalerRepository.findById(request.getWholesalerId())
                .orElseThrow(() -> new ResourceNotFoundException(WHOLESALER_NOT_FOUND + request.getWholesalerId()));

        // Create order items
        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemRequest -> createOrderItem(itemRequest, wholesaler))
                .collect(Collectors.toList());

        log.info("Created {} order items", orderItems.size());

        // Calculate totals
        BigDecimal subtotal = orderItems.stream()
                .map(OrderItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax);

        log.info("Subtotal: {}, Tax: {}, Total: {}", subtotal, tax, total);

        // Create order
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
        log.info("Order saved with ID: {}", savedOrder.getId());

        // Save items and reduce stock
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            OrderItem savedItem = orderItemRepository.save(item);
            log.info("Saved item ID: {} for product: {}", savedItem.getId(), item.getProduct().getName());

            // Reduce stock
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        // Clear from cart
        request.getItems().forEach(itemRequest ->
                cartItemRepository.findBySellerIdAndProductId(seller.getId(), itemRequest.getProductId())
                        .ifPresent(cartItem -> {
                            cartItemRepository.delete(cartItem);
                            log.info("Removed from cart: product {}", itemRequest.getProductId());
                        })
        );

        List<OrderItem> itemsFromDb = orderItemRepository.findByOrderId(savedOrder.getId());
        log.info("Manually loaded {} items from database", itemsFromDb.size());

        // Clear and add instead of replacing the collection
        savedOrder.getItems().clear();
        savedOrder.getItems().addAll(itemsFromDb);

        log.info("Final order has {} items", savedOrder.getItems().size());
        OrderResponseDTO response = mapToDTO(savedOrder);
        log.info("Response DTO has {} items", response.getItems().size());

        return response;
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
                        SELLER_NOT_FOUND + sellerId
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
                        SELLER_NOT_FOUND + sellerId
                ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ORDER_NOT_FOUND + orderId
                ));

        if (!order.getSeller().getId().equals(seller.getId())) {
            log.error("Order {} belongs to seller {}, not seller {}",
                    orderId, order.getSeller().getId(), sellerId);
            throw new ResourceNotFoundException(
                    ORDER_NOT_FOUND_FOR_SELLER + sellerId
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
                        SELLER_NOT_FOUND + sellerId
                ));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ORDER_NOT_FOUND + orderId
                ));

        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new ResourceNotFoundException(ORDER_NOT_BELONG_TO_SELLER);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException(ONLY_PENDING_ORDERS_CAN_CANCELED);
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
                        SELLER_NOT_FOUND + sellerId
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
                        SELLER_NOT_FOUND + sellerId
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
                .orElseThrow(() -> new ResourceNotFoundException(PRODUCT_NOT_FOUND));

        if (!product.getWholesaler().getId().equals(wholesaler.getId())) {
            throw new RuntimeException(PRODUCT_NOT_BELONG_TO_WHOLESALER);
        }

        if (product.getStockQuantity() < itemRequest.getQuantity()) {
            throw new RuntimeException(INSUFFICIEND_STOCK + product.getName());
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
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern(DATE_PATTERN));
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
        OrderItemDTO dto = modelMapper.map(item, OrderItemDTO.class);
        if (item.getProduct() != null) {
            dto.setProductId(item.getProduct().getId());
        }

        return dto;
    }
}
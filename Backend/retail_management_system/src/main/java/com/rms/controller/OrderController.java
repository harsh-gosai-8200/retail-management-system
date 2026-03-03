package com.rms.controller;

import com.rms.dto.OrderRequestDTO;
import com.rms.dto.OrderResponseDTO;
import com.rms.dto.OrderSummaryDTO;
import com.rms.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * Place order
     * @param request
     * @return
     */
    @PostMapping("/place")
    public ResponseEntity<OrderResponseDTO> placeOrder(@Valid @RequestBody OrderRequestDTO request) {
        if (request.getSellerId() == null) {
            return ResponseEntity.badRequest().build();
        }
        OrderResponseDTO order = orderService.placeOrder(request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    /**
     * Get seller orders
     * @param sellerId
     * @param status
     * @param pageable
     * @return
     */
    @GetMapping("/my-orders")
    public ResponseEntity<Map<String, Object>> getMyOrders(
            @RequestParam Long sellerId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Page<OrderResponseDTO> ordersPage = orderService.getSellerOrders(sellerId, status, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("orders", ordersPage.getContent());
        response.put("currentPage", ordersPage.getNumber());
        response.put("totalItems", ordersPage.getTotalElements());
        response.put("totalPages", ordersPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Get order details
     * @param sellerId
     * @param orderId
     * @return
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderDetails(
            @RequestParam Long sellerId,
            @PathVariable Long orderId) {

        OrderResponseDTO order = orderService.getOrderDetails(sellerId, orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * Cancel order
     * @param sellerId
     * @param orderId
     * @return
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDTO> cancelOrder(
            @RequestParam Long sellerId,
            @PathVariable Long orderId) {

        OrderResponseDTO order = orderService.cancelOrder(sellerId, orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * Get order summary
     * @param sellerId
     * @return
     */
    @GetMapping("/summary")
    public ResponseEntity<OrderSummaryDTO> getOrderSummary(@RequestParam Long sellerId) {
        OrderSummaryDTO summary = orderService.getOrderSummary(sellerId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get recent orders
     * @param sellerId
     * @return
     */
    @GetMapping("/recent")
    public ResponseEntity<List<OrderResponseDTO>> getRecentOrders(@RequestParam Long sellerId) {
        List<OrderResponseDTO> orders = orderService.getRecentOrders(sellerId);
        return ResponseEntity.ok(orders);
    }
}
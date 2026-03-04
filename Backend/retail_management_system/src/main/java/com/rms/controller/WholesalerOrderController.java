package com.rms.controller;

import com.rms.dto.*;
import com.rms.service.WholesalerOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wholesaler/orders")
@RequiredArgsConstructor
public class WholesalerOrderController {

    private final WholesalerOrderService orderService;

    /**
     * 1. Get all orders for a wholesaler (with optional status filter)
     */
    @GetMapping
    public ResponseEntity<Page<OrderResponseDTO>> getOrders(
            @RequestParam Long wholesalerId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        return ResponseEntity.ok(orderService.getOrders(wholesalerId, status, pageable));
    }

    /**
     * 2. Get only pending orders (quick view)
     */
    @GetMapping("/pending")
    public ResponseEntity<Page<OrderResponseDTO>> getPendingOrders(
            @RequestParam Long wholesalerId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.ASC)
            Pageable pageable) {

        return ResponseEntity.ok(orderService.getPendingOrders(wholesalerId, pageable));
    }

    /**
     * 3. Get single order details
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderDetails(
            @RequestParam Long wholesalerId,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(orderService.getOrderDetails(wholesalerId, orderId));
    }

    /**
     * 4. Approve order - returns Approval DTO
     */
    @PostMapping("/{orderId}/approve")
    public ResponseEntity<OrderApprovalDTO> approveOrder(
            @RequestParam Long wholesalerId,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(orderService.approveOrder(wholesalerId, orderId));
    }

    /**
     * 5. Reject order with reason - returns OrderResponseDTO
     */
    @PostMapping("/{orderId}/reject")
    public ResponseEntity<OrderResponseDTO> rejectOrder(
            @RequestParam Long wholesalerId,
            @PathVariable Long orderId,
            @Valid @RequestBody RejectionDTO rejectionDTO) {

        return ResponseEntity.ok(orderService.rejectOrder(wholesalerId, orderId, rejectionDTO));
    }

    /**
     * 6. Update order status (PROCESSING, SHIPPED, DELIVERED)
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @RequestParam Long wholesalerId,
            @PathVariable Long orderId,
            @Valid @RequestBody StatusUpdateDTO statusUpdate) {

        return ResponseEntity.ok(orderService.updateOrderStatus(
                wholesalerId, orderId, statusUpdate));
    }

    /**
     * 7. Get dashboard statistics - returns Stats DTO
     */
    @GetMapping("/stats")
    public ResponseEntity<WholesalerStatsDTO> getStatistics(@RequestParam Long wholesalerId) {
        return ResponseEntity.ok(orderService.getStatistics(wholesalerId));
    }

    /**
     * 8. Get recent orders preview
     */
    @GetMapping("/recent")
    public ResponseEntity<RecentOrdersDTO> getRecentOrders(
            @RequestParam Long wholesalerId,
            @RequestParam(defaultValue = "5") int limit) {

        return ResponseEntity.ok(orderService.getRecentOrders(wholesalerId, limit));
    }
}
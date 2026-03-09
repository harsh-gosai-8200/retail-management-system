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
     * Get all orders for a wholesaler
     * @param wholesalerId
     * @param status
     * @param pageable
     * @return
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
     * Get only pending orders
     * @param wholesalerId
     * @param pageable
     * @return
     */
    @GetMapping("/pending")
    public ResponseEntity<Page<OrderResponseDTO>> getPendingOrders(
            @RequestParam Long wholesalerId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.ASC)
            Pageable pageable) {

        return ResponseEntity.ok(orderService.getPendingOrders(wholesalerId, pageable));
    }

    /**
     * Get single order details
     * @param wholesalerId
     * @param orderId
     * @return
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderDetails(
            @RequestParam Long wholesalerId,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(orderService.getOrderDetails(wholesalerId, orderId));
    }

    /**
     * Approve order
     * @param wholesalerId
     * @param orderId
     * @return
     */
    @PostMapping("/{orderId}/approve")
    public ResponseEntity<OrderApprovalDTO> approveOrder(
            @RequestParam Long wholesalerId,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(orderService.approveOrder(wholesalerId, orderId));
    }

    /**
     * Reject order with reason
     * @param wholesalerId
     * @param orderId
     * @param rejectionDTO
     * @return
     */
    @PostMapping("/{orderId}/reject")
    public ResponseEntity<OrderResponseDTO> rejectOrder(
            @RequestParam Long wholesalerId,
            @PathVariable Long orderId,
            @Valid @RequestBody RejectionDTO rejectionDTO) {

        return ResponseEntity.ok(orderService.rejectOrder(wholesalerId, orderId, rejectionDTO));
    }

    /**
     * Update order status
     * @param wholesalerId
     * @param orderId
     * @param statusUpdate
     * @return
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
     * Get dashboard statistics
     * @param wholesalerId
     * @return
     */
    @GetMapping("/stats")
    public ResponseEntity<WholesalerStatsDTO> getStatistics(@RequestParam Long wholesalerId) {
        return ResponseEntity.ok(orderService.getStatistics(wholesalerId));
    }

    /**
     * Get recent orders preview
     * @param wholesalerId
     * @param limit
     * @return
     */
    @GetMapping("/recent")
    public ResponseEntity<RecentOrdersDTO> getRecentOrders(
            @RequestParam Long wholesalerId,
            @RequestParam(defaultValue = "5") int limit) {

        return ResponseEntity.ok(orderService.getRecentOrders(wholesalerId, limit));
    }
}
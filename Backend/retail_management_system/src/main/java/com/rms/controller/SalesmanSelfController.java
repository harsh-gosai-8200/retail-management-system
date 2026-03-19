package com.rms.controller;

import com.rms.dto.*;
import com.rms.service.SalesmanSelfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salesman")
@RequiredArgsConstructor
public class SalesmanSelfController {

    private final SalesmanSelfService salesmanService;

    /**
     * get salesman profile from service
     * @param salesmanId
     * @return
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('SALESMAN')")
    public ResponseEntity<SalesmanProfileDTO> getMyProfile(
            @RequestParam(required = false) Long salesmanId) {
        return ResponseEntity.ok(salesmanService.getMyProfile(salesmanId));
    }


    /**
     * update salesman profile from salesman side
     * @param salesmanId
     * @param updateDTO
     * @return
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('SALESMAN')")
    public ResponseEntity<SalesmanProfileDTO> updateMyProfile(
            @RequestParam(required = false) Long salesmanId,
            @Valid @RequestBody SalesmanProfileUpdateDTO updateDTO) {
        return ResponseEntity.ok(
                salesmanService.updateMyProfile(salesmanId, updateDTO)
        );
    }

    /**
     * get all seller assign to salesman
     * @param salesmanId
     * @return
     */
    @GetMapping("/assigned-sellers")
    @PreAuthorize("hasRole('SALESMAN')")
    public ResponseEntity<List<AssignedSellerDTO>> getMyAssignedSellers(
            @RequestParam(required = false) Long salesmanId) {
        return ResponseEntity.ok(
                salesmanService.getMyAssignedSellers(salesmanId)
        );
    }


    /**
     * get all order of assign sellers to salesman
     * @param salesmanId
     * @param status
     * @param pageable
     * @return
     */
    @GetMapping("/orders")
    @PreAuthorize("hasRole('SALESMAN')")
    public ResponseEntity<PaginatedResponseDTO<SalesmanOrderDTO>> getMyOrders(
            @RequestParam(required = false) Long salesmanId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(
                salesmanService.getOrdersFromMySellers(salesmanId, status, pageable)
        );
    }

    /**
     * get individual order details
     * @param salesmanId
     * @param orderId
     * @return
     */
    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasRole('SALESMAN')")
    public ResponseEntity<SalesmanOrderDTO> getOrderDetails(
            @RequestParam(required = false) Long salesmanId,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(
                salesmanService.getOrderDetails(salesmanId, orderId)
        );
    }

    /**
     * mark order status as delivery
     * @param salesmanId
     * @param orderId
     * @param deliveryDTO
     * @return
     */
    @PostMapping("/orders/{orderId}/deliver")
    @PreAuthorize("hasRole('SALESMAN')")
    public ResponseEntity<DeliveryResponseDTO> markAsDelivered(
            @RequestParam(required = false) Long salesmanId,
            @PathVariable Long orderId,
            @Valid @RequestBody DeliveryUpdateDTO deliveryDTO) {
        return ResponseEntity.ok(
                salesmanService.markOrderAsDelivered(salesmanId, orderId, deliveryDTO)
        );
    }

    /**
     * change order status other than delivery if any of problem accure
     * @param salesmanId
     * @param orderId
     * @param status
     * @param notes
     * @return
     */
    @PatchMapping("/orders/{orderId}/delivery-status")
    @PreAuthorize("hasRole('SALESMAN')")
    public ResponseEntity<DeliveryResponseDTO> updateDeliveryStatus(
            @RequestParam(required = false) Long salesmanId,
            @PathVariable Long orderId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(
                salesmanService.updateDeliveryStatus(salesmanId, orderId, status, notes)
        );
    }

    /**
     * get dashboard data and statistics for salesman
     * @param salesmanId
     * @return
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SALESMAN')")
    public ResponseEntity<SalesmanDashboardDTO> getDashboard(
            @RequestParam(required = false) Long salesmanId) {
        return ResponseEntity.ok(
                salesmanService.getMyDashboardStats(salesmanId)
        );
    }


    /**
     * get all orders of individuals seller assign to salesman
     * @param salesmanId
     * @param sellerId
     * @param status
     * @return
     */
    @GetMapping("/sellers/{sellerId}/orders")
    @PreAuthorize("hasRole('SALESMAN')")
    public ResponseEntity<List<SalesmanOrderDTO>> getSellerOrders(
            @RequestParam(required = false) Long salesmanId,
            @PathVariable Long sellerId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(
                salesmanService.getSellerOrders(salesmanId, sellerId, status)
        );
    }
}
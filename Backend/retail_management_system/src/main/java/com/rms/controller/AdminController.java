package com.rms.controller;

import com.rms.dto.*;
import com.rms.dto.PaymentTransactionDTO;
import com.rms.service.AdminService;
import com.rms.service.PaymentGatewayService;
import com.rms.service.SalesmanSelfService;
import com.rms.service.SystemLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final PaymentGatewayService paymentGatewayService;
    private final SalesmanSelfService salesmanService;
    private final SystemLogService systemLogService;


    /**
     * method for getting dashboard statistics
     * @return
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        log.info("API: GET /admin/dashboard/stats");
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    /**
     * getting all users
     * @param role
     * @param isActive
     * @param search
     * @param pageable
     * @return
     */
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserDTO>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("API: GET /admin/users");
        return ResponseEntity.ok(adminService.getAllUsers(role, isActive, search, pageable));
    }

    /**
     * getting particulate user data by its id
     * @param userId
     * @return
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<AdminUserDTO> getUserDetails(@PathVariable Long userId) {
        log.info("API: GET /admin/users/{}", userId);
        return ResponseEntity.ok(adminService.getUserDetails(userId));
    }

    /**
     * toggling user status for indicating its activeness
     * @param userId
     * @return
     */
    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<AdminUserDTO> toggleUserStatus(@PathVariable Long userId) {
        log.info("API: PATCH /admin/users/{}/toggle-status", userId);
        return ResponseEntity.ok(adminService.toggleUserStatus(userId));
    }

    /**
     * Get ALL transactions (admin view) with filters
     * @param status
     * @param paymentMethod
     * @param startDate
     * @param endDate
     * @param userId
     * @param pageable
     * @return
     */
    @GetMapping("/payments")
    public ResponseEntity<Page<PaymentTransactionDTO>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("API: GET /admin/payments - userId: {}, status: {}, startDate: {}, endDate: {}",
                userId, status, startDate, endDate);

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        Page<PaymentTransactionDTO> payments = adminService.getAllPayments(status, paymentMethod, startDateTime, endDateTime, userId, pageable);
        return ResponseEntity.ok(payments);
    }

    /**
     * Get payment details by ID
     * @param paymentId
     * @return
     */
    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<PaymentTransactionDTO> getPaymentDetails(@PathVariable Long paymentId) {
        log.info("API: GET /admin/payments/{}", paymentId);
        return ResponseEntity.ok(adminService.getPaymentDetails(paymentId));
    }

    /**
     * Get payments for a specific user (from user detail page)
     * @param userId
     * @param pageable
     * @return
     */
    @GetMapping("/users/{userId}/payments")
    public ResponseEntity<Page<PaymentTransactionDTO>> getUserPayments(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("API: GET /admin/users/{}/payments", userId);
        return ResponseEntity.ok(adminService.getUserPayments(userId, pageable));
    }

    /**
     * Get all system logs with filters
     * @param userId
     * @param action
     * @param startDate
     * @param endDate
     * @param pageable
     * @return
     */
    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<SystemLogResponseDTO>> getSystemLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("API: GET /admin/logs - userId: {}, action: {}, startDate: {}, endDate: {}",
                userId, action, startDate, endDate);

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        Page<SystemLogResponseDTO> logs = systemLogService.getLogsWithFilters(userId, action, startDateTime, endDateTime, pageable);

        return ResponseEntity.ok(logs);
    }

    /**
     * Get logs for a specific user
     * @param userId
     * @param action
     * @param startDate
     * @param endDate
     * @param pageable
     * @return
     */
    @GetMapping("/users/{userId}/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<SystemLogResponseDTO>> getUserLogs(
            @PathVariable Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("API: GET /admin/users/{}/logs", userId);

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        Page<SystemLogResponseDTO> logs = systemLogService.getLogsByUserId(userId, action, startDateTime, endDateTime, pageable);

        return ResponseEntity.ok(logs);
    }

    /**
     * Get log by ID
     * @param logId
     * @return
     */
    @GetMapping("/logs/{logId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemLogResponseDTO> getLogById(@PathVariable Long logId) {
        log.info("API: GET /admin/logs/{}", logId);

        SystemLogResponseDTO log = systemLogService.getLogById(logId);

        return ResponseEntity.ok(log);
    }

    /**
     * getting salesman all delivered orders from salesman details
     * @param salesmanId
     * @param status
     * @param pageable
     * @return
     */
    @GetMapping("/salesman-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaginatedResponseDTO<SalesmanOrderDTO>> getSalesmanOrders(
            @RequestParam Long salesmanId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("API: GET /admin/salesman-orders - salesmanId: {}, status: {}", salesmanId, status);

        return ResponseEntity.ok(salesmanService.getOrdersFromMySellers(salesmanId, status, pageable));
    }

    /**
     * getting entire system orders
     * @param status
     * @param paymentStatus
     * @param startDate
     * @param endDate
     * @param userId
     * @param pageable
     * @return
     */
    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponseDTO>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        log.info("API: GET /admin/orders - userId: {}, status: {}, paymentStatus: {}, startDate: {}, endDate: {}",
                userId, status, paymentStatus, startDate, endDate);

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : null;

        return ResponseEntity.ok(adminService.getAllOrders(status, paymentStatus, startDateTime, endDateTime, userId, pageable));
    }

    /**
     * getting order details for order details page
     * @param orderId
     * @return
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponseDTO> getOrderDetails(@PathVariable Long orderId) {
        log.info("API: GET /admin/orders/{}", orderId);
        return ResponseEntity.ok(adminService.getOrderDetails(orderId));
    }

    /**
     * getting particulate user(localseller)
     * @param userId
     * @param status
     * @param pageable
     * @return
     */
    @GetMapping("/users/{userId}/orders")
    public ResponseEntity<Page<OrderResponseDTO>> getUserOrders(
            @PathVariable Long userId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("API: GET /admin/users/{}/orders", userId);
        return ResponseEntity.ok(adminService.getUserOrders(userId, status, pageable));
    }
}
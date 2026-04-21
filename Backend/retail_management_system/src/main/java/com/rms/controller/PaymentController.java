package com.rms.controller;

import com.rms.dto.*;
import com.rms.service.PaymentGatewayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentGatewayService paymentGatewayService;

    /**
     * creating order for payment
     * @param request
     * @return
     */
    @PostMapping("/create-order")
    @PreAuthorize("hasRole('LOCAL_SELLER')")
    public ResponseEntity<CreateOrderResponseDTO> createOrder(
            @Valid @RequestBody CreateOrderRequestDTO request) {
        return ResponseEntity.ok(paymentGatewayService.createRazorpayOrder(request));
    }

    /**
     * verify payment for order completion
     * @param verifyRequest
     * @return
     */
    @PostMapping("/verify")
    @PreAuthorize("hasRole('LOCAL_SELLER')")
    public ResponseEntity<PaymentResponseDTO> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequestDTO verifyRequest) {
        return ResponseEntity.ok(paymentGatewayService.verifyPayment(verifyRequest));
    }

    /**
     * getting transaction by order id
     * @param orderId
     * @return
     */
    @GetMapping("/transaction/order/{orderId}")
    @PreAuthorize("hasAnyRole('LOCAL_SELLER', 'WHOLESALER')")
    public ResponseEntity<PaymentTransactionDTO> getTransactionByOrderId(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentGatewayService.getTransactionByOrderId(orderId));
    }

    /**
     * getting transaction by payment id
     * @param paymentId
     * @return
     */
    @GetMapping("/transaction/payment/{paymentId}")
    @PreAuthorize("hasAnyRole('LOCAL_SELLER', 'WHOLESALER', 'ADMIN')")
    public ResponseEntity<PaymentTransactionDTO> getTransactionByPaymentId(
            @PathVariable String paymentId) {
        return ResponseEntity.ok(paymentGatewayService.getTransactionByPaymentId(paymentId));
    }

    /**
     * getting particular user's all transaction
     * @param userId
     * @param pageable
     * @return
     */
    @GetMapping("/transactions/user/{userId}")
    @PreAuthorize("hasAnyRole('LOCAL_SELLER', 'ADMIN')")
    public ResponseEntity<Page<PaymentTransactionDTO>> getUserTransactions(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(paymentGatewayService.getTransactionsByUser(userId, pageable));
    }

    /**
     * getting particular wholesaler all transactions by id
     * @param wholesalerId
     * @param pageable
     * @return
     */
    @GetMapping("/transactions/wholesaler/{wholesalerId}")
    @PreAuthorize("hasAnyRole('WHOLESALER', 'ADMIN')")
    public ResponseEntity<Page<PaymentTransactionDTO>> getWholesalerTransactions(
            @PathVariable Long wholesalerId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(paymentGatewayService.getTransactionsByWholesaler(wholesalerId, pageable));
    }

    /**
     * initiate refund process for admin
     * @param refundRequest
     * @return
     */
    @PostMapping("/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RefundResponseDTO> initiateRefund(
            @Valid @RequestBody RefundRequestDTO refundRequest) {
        return ResponseEntity.ok(paymentGatewayService.initiateRefund(refundRequest));
    }

    /**
     * getting refund status for admin
     * @param refundId
     * @return
     */
    @GetMapping("/refund/{refundId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RefundResponseDTO> getRefundStatus(
            @PathVariable String refundId) {
        return ResponseEntity.ok(paymentGatewayService.getRefundStatus(refundId));
    }

    /**
     * getting payment status
     * @param userId
     * @return
     */
    @GetMapping("/stats/user/{userId}")
    @PreAuthorize("hasAnyRole('LOCAL_SELLER', 'ADMIN')")
    public ResponseEntity<PaymentStatsDTO> getUserPaymentStats(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentGatewayService.getPaymentStats(userId));
    }

    /**
     * getting payment status for wholesaler
     * @param wholesalerId
     * @return
     */
    @GetMapping("/stats/wholesaler/{wholesalerId}")
    @PreAuthorize("hasAnyRole('WHOLESALER', 'ADMIN')")
    public ResponseEntity<PaymentStatsDTO> getWholesalerPaymentStats(@PathVariable Long wholesalerId) {
        return ResponseEntity.ok(paymentGatewayService.getWholesalerPaymentStats(wholesalerId));
    }
}
package com.rms.service;

import com.rms.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentGatewayService {

    CreateOrderResponseDTO createRazorpayOrder(CreateOrderRequestDTO request);

    PaymentResponseDTO verifyPayment(VerifyPaymentRequestDTO verifyRequest);

    PaymentTransactionDTO getTransactionByOrderId(Long orderId);

    PaymentTransactionDTO getTransactionByPaymentId(String paymentId);

    Page<PaymentTransactionDTO> getTransactionsByUser(Long userId, Pageable pageable);

    Page<PaymentTransactionDTO> getTransactionsByWholesaler(Long wholesalerId, Pageable pageable);

    RefundResponseDTO initiateRefund(RefundRequestDTO refundRequest);

    RefundResponseDTO getRefundStatus(String refundId);

    PaymentStatsDTO getPaymentStats(Long userId);

    PaymentStatsDTO getWholesalerPaymentStats(Long wholesalerId);
}

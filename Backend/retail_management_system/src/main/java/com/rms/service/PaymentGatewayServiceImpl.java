package com.rms.service;



import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.Refund;
import com.razorpay.Utils;
import com.rms.dto.*;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.Order;
import com.rms.model.PaymentTransaction;
import com.rms.model.enums.PaymentMethod;
import com.rms.model.enums.PaymentStatus;
import com.rms.repository.InvoiceRepository;
import com.rms.repository.OrderRepository;
import com.rms.repository.PaymentTransactionRepository;
import com.rms.specification.PaymentTransactionSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentGatewayServiceImpl implements PaymentGatewayService {

    private final RazorpayClient razorpayClient;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final InvoiceRepository invoiceRepository;
    private final SystemLogService systemLogService;

    @Value("${razorpay.keyId}")
    private String razorpayKeyId;

    @Value("${razorpay.keySecret}")
    private String razorpayKeySecret;

    private static final String CURRENCY_INR = "INR";

    /**
     * creating razorpay order for given amount
     * @param request
     * @return
     */
    @Override
    @Transactional
    public CreateOrderResponseDTO createRazorpayOrder(CreateOrderRequestDTO request) {
        log.info("Creating Razorpay order for order ID: {}", request.getOrderId());

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        if (!"PENDING".equals(order.getPaymentStatus())) {
            throw new IllegalStateException("Order payment is already processed. Status: " + order.getPaymentStatus());
        }

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.getAmount().multiply(BigDecimal.valueOf(100)).intValue());
            orderRequest.put("currency", CURRENCY_INR);
            orderRequest.put("receipt", order.getOrderNumber());
            orderRequest.put("payment_capture", 1);

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            log.info("Razorpay order created: {} for order: {}", razorpayOrder.get("id"), order.getOrderNumber());

            return CreateOrderResponseDTO.builder()
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .razorpayKeyId(razorpayKeyId)
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .amount(request.getAmount())
                    .currency(CURRENCY_INR)
                    .build();

        } catch (Exception e) {
            log.error("Failed to create Razorpay order: {}", e.getMessage());
            throw new RuntimeException("Payment gateway error: " + e.getMessage());
        }
    }

    /**
     * verify user payment pay to razorpay
     * @param verifyRequest
     * @return
     */
    @Override
    @Transactional
    public PaymentResponseDTO verifyPayment(VerifyPaymentRequestDTO verifyRequest) {
        log.info("Verifying payment for order: {}", verifyRequest.getOrderId());

        try {
            // Verify payment signature
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", verifyRequest.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", verifyRequest.getRazorpayPaymentId());
            attributes.put("razorpay_signature", verifyRequest.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);

            if (!isValid) {
                log.error("Invalid payment signature for order: {}", verifyRequest.getOrderId());
                logFailedTransaction(verifyRequest, "Invalid signature");

                return PaymentResponseDTO.builder()
                        .success(false)
                        .message("Payment verification failed: Invalid signature")
                        .orderId(verifyRequest.getOrderId())
                        .build();
            }

            // Update order
            Order order = orderRepository.findById(verifyRequest.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + verifyRequest.getOrderId()));

            order.setPaymentStatus("PAID");
            order.setTransactionId(verifyRequest.getRazorpayPaymentId());
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            invoiceRepository.findByOrderId(order.getId()).ifPresent(invoice -> {
                invoice.setStatus("PAID");
                invoice.setPaidAt(LocalDateTime.now());
                invoiceRepository.save(invoice);
                log.info("Invoice {} updated to PAID", invoice.getInvoiceNumber());
            });

            // Save payment transaction
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setOrder(order);
            transaction.setRazorpayOrderId(verifyRequest.getRazorpayOrderId());
            transaction.setRazorpayPaymentId(verifyRequest.getRazorpayPaymentId());
            transaction.setAmount(order.getTotalAmount());
            transaction.setCurrency(CURRENCY_INR);
            transaction.setStatus(PaymentStatus.SUCCESS);
            transaction.setPaidAt(LocalDateTime.now());
            transaction.setPaymentMethod(determinePaymentMethod(verifyRequest));
            PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);

            // Update invoice if exists
            invoiceRepository.findByOrderId(order.getId()).ifPresent(invoice -> {
                invoice.setStatus("PAID");
                invoice.setPaidAt(LocalDateTime.now());
                invoiceRepository.save(invoice);
                log.info("Invoice {} updated to PAID", invoice.getInvoiceNumber());
            });

            systemLogService.saveLog(
                    order.getSeller().getUser().getId(),
                    "PAYMENT_SUCCESS",
                    "PAYMENT",
                    savedTransaction.getId(),
                    String.format("Payment of ₹%.2f received for order %s", order.getTotalAmount(), order.getOrderNumber())
            );

            log.info("Payment verified successfully for order: {}", order.getOrderNumber());

            return PaymentResponseDTO.builder()
                    .success(true)
                    .message("Payment successful!")
                    .orderId(order.getId())
                    .orderNumber(order.getOrderNumber())
                    .paymentId(verifyRequest.getRazorpayPaymentId())
                    .status("PAID")
                    .transactionId(savedTransaction.getId())
                    .build();

        } catch (Exception e) {
            log.error("Payment verification failed: {}", e.getMessage());
            logFailedTransaction(verifyRequest, e.getMessage());
            return PaymentResponseDTO.builder()
                    .success(false)
                    .message("Payment verification failed: " + e.getMessage())
                    .orderId(verifyRequest.getOrderId())
                    .build();
        }
    }

    /**
     * getting transaction details by its id
     * @param orderId
     * @return
     */
    @Override
    public PaymentTransactionDTO getTransactionByOrderId(Long orderId) {
        log.info("Fetching transaction for order: {}", orderId);

        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found for order: " + orderId));

        return mapToTransactionDTO(transaction);
    }

    /**
     * getting transaction by its payment id
     * @param paymentId
     * @return
     */
    @Override
    public PaymentTransactionDTO getTransactionByPaymentId(String paymentId) {
        log.info("Fetching transaction for payment: {}", paymentId);

        PaymentTransaction transaction = paymentTransactionRepository.findByRazorpayPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found for payment: " + paymentId));

        return mapToTransactionDTO(transaction);
    }

    /**
     * get all transaction user-wise for seller and admin
     * @param userId
     * @param pageable
     * @return
     */
    @Override
    public Page<PaymentTransactionDTO> getTransactionsByUser(Long userId, Pageable pageable) {
        log.info("Fetching transactions for user: {}", userId);

        Specification<PaymentTransaction> spec = PaymentTransactionSpecification.bySellerId(userId);

        return paymentTransactionRepository.findAll(spec, pageable)
                .map(this::mapToTransactionDTO);
    }

    /**
     * get transactions wholesaler-wise for wholesaler and admin
     * @param wholesalerId
     * @param pageable
     * @return
     */
    @Override
    public Page<PaymentTransactionDTO> getTransactionsByWholesaler(Long wholesalerId, Pageable pageable) {
        log.info("Fetching transactions for wholesaler: {}", wholesalerId);

        Specification<PaymentTransaction> spec = PaymentTransactionSpecification.byWholesalerId(wholesalerId);

        return paymentTransactionRepository.findAll(spec, pageable)
                .map(this::mapToTransactionDTO);
    }

    /**
     * payment refund method for admin
     * @param refundRequest
     * @return
     */
    @Override
    @Transactional
    public RefundResponseDTO initiateRefund(RefundRequestDTO refundRequest) {
        log.info("Initiating refund for payment: {}", refundRequest.getPaymentId());

        try {
            Payment payment = razorpayClient.payments.fetch(refundRequest.getPaymentId());

            // Create refund request
            JSONObject refundRequestObj = new JSONObject();
            refundRequestObj.put("amount", refundRequest.getAmount().multiply(BigDecimal.valueOf(100)).intValue());
            refundRequestObj.put("speed", "normal");
            refundRequestObj.put("payment_id", refundRequest.getPaymentId());
            refundRequestObj.put("notes", Map.of("reason", refundRequest.getReason() != null ? refundRequest.getReason() : "Customer requested refund"));

            Refund refund = razorpayClient.refunds.create(refundRequestObj);

            // Update transaction record
            PaymentTransaction transaction = paymentTransactionRepository
                    .findByRazorpayPaymentId(refundRequest.getPaymentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

            transaction.setStatus(PaymentStatus.REFUNDED);
            transaction.setRefundId(refund.get("id"));
            transaction.setRefundAmount(refundRequest.getAmount());
            transaction.setRefundedAt(LocalDateTime.now());
            paymentTransactionRepository.save(transaction);

            systemLogService.saveLog(
                    17L,
                    "REFUND_PROCESSED",
                    "PAYMENT",
                    transaction.getId(),
                    String.format("Refund of ₹%.2f processed", refundRequest.getAmount())
            );

            log.info("Refund initiated successfully for payment: {}", refundRequest.getPaymentId());

            return RefundResponseDTO.builder()
                    .success(true)
                    .refundId(refund.get("id"))
                    .amount(refundRequest.getAmount())
                    .status("SUCCESS")
                    .message("Refund initiated successfully")
                    .build();

        } catch (Exception e) {
            log.error("Refund failed: {}", e.getMessage());
            return RefundResponseDTO.builder()
                    .success(false)
                    .message("Refund failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * getting refund status for user and admin
     * @param refundId
     * @return
     */
    @Override
    public RefundResponseDTO getRefundStatus(String refundId) {
        log.info("Getting refund status for refund: {}", refundId);

        try {
            Refund refund = razorpayClient.refunds.fetch(refundId);

            return RefundResponseDTO.builder()
                    .success(true)
                    .refundId(refundId)
                    .amount(BigDecimal.valueOf(Long.parseLong(refund.get("amount").toString()) / 100))
                    .status(refund.get("status"))
                    .message("Refund status: " + refund.get("status"))
                    .build();

        } catch (Exception e) {
            log.error("Failed to fetch refund status: {}", e.getMessage());
            return RefundResponseDTO.builder()
                    .success(false)
                    .message("Failed to fetch refund status: " + e.getMessage())
                    .build();
        }
    }

    /**
     * get payment status for tracking payment for wholesaler and salesman
     * @param userId
     * @return
     */
    @Override
    public PaymentStatsDTO getPaymentStats(Long userId) {
        log.info("Getting payment stats for user: {}", userId);

        Specification<PaymentTransaction> spec = PaymentTransactionSpecification.byUserId(userId);

        long totalTransactions = paymentTransactionRepository.count(spec);
        long successfulTransactions = paymentTransactionRepository.count(
                spec.and(PaymentTransactionSpecification.byStatus(PaymentStatus.SUCCESS)));
        long failedTransactions = paymentTransactionRepository.count(
                spec.and(PaymentTransactionSpecification.byStatus(PaymentStatus.FAILED)));
        long refundedTransactions = paymentTransactionRepository.count(
                spec.and(PaymentTransactionSpecification.byStatus(PaymentStatus.REFUNDED)));

        BigDecimal totalAmount = paymentTransactionRepository.findAll(spec).stream()
                .filter(t -> t.getStatus() == PaymentStatus.SUCCESS)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PaymentStatsDTO.builder()
                .totalTransactions(totalTransactions)
                .successfulTransactions(successfulTransactions)
                .failedTransactions(failedTransactions)
                .refundedTransactions(refundedTransactions)
                .totalAmount(totalAmount)
                .build();
    }

    /**
     * getting wholesaler payment status for portal subscription and plans
     * @param wholesalerId
     * @return
     */
    @Override
    public PaymentStatsDTO getWholesalerPaymentStats(Long wholesalerId) {
        log.info("Getting payment stats for wholesaler: {}", wholesalerId);

        Specification<PaymentTransaction> spec = PaymentTransactionSpecification.byWholesalerId(wholesalerId);

        long totalTransactions = paymentTransactionRepository.count(spec);
        long successfulTransactions = paymentTransactionRepository.count(
                spec.and(PaymentTransactionSpecification.byStatus(PaymentStatus.SUCCESS)));
        long failedTransactions = paymentTransactionRepository.count(
                spec.and(PaymentTransactionSpecification.byStatus(PaymentStatus.FAILED)));
        long refundedTransactions = paymentTransactionRepository.count(
                spec.and(PaymentTransactionSpecification.byStatus(PaymentStatus.REFUNDED)));

        BigDecimal totalAmount = paymentTransactionRepository.findAll(spec).stream()
                .filter(t -> t.getStatus() == PaymentStatus.SUCCESS)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PaymentStatsDTO.builder()
                .totalTransactions(totalTransactions)
                .successfulTransactions(successfulTransactions)
                .failedTransactions(failedTransactions)
                .refundedTransactions(refundedTransactions)
                .totalAmount(totalAmount)
                .build();
    }

    /**
     * helper method for determine payment method for now only use card for trial
     * @param verifyRequest
     * @return
     */
    private PaymentMethod determinePaymentMethod(VerifyPaymentRequestDTO verifyRequest) {
        // we can extract payment method from Razorpay response
        // For now, default to UPI
        return PaymentMethod.CARD;
    }

    /**
     * saved failed transaction for refund inquiry if need to verify
     * @param verifyRequest
     * @param reason
     */
    private void logFailedTransaction(VerifyPaymentRequestDTO verifyRequest, String reason) {
        try {
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setRazorpayOrderId(verifyRequest.getRazorpayOrderId());
            transaction.setRazorpayPaymentId(verifyRequest.getRazorpayPaymentId());
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setFailureReason(reason);
            paymentTransactionRepository.save(transaction);
        } catch (Exception e) {
            log.error("Failed to log failed transaction: {}", e.getMessage());
        }
    }

    private PaymentTransactionDTO mapToTransactionDTO(PaymentTransaction transaction) {
        return PaymentTransactionDTO.builder()
                .id(transaction.getId())
                .orderId(transaction.getOrder().getId())
                .orderNumber(transaction.getOrder().getOrderNumber())
                .razorpayOrderId(transaction.getRazorpayOrderId())
                .razorpayPaymentId(transaction.getRazorpayPaymentId())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .status(transaction.getStatus() != null ? transaction.getStatus().name() : null)
                .paymentMethod(transaction.getPaymentMethod() != null ? transaction.getPaymentMethod().name() : null)
                .createdAt(transaction.getCreatedAt())
                .paidAt(transaction.getPaidAt())
                .isRefunded(transaction.getRefundId() != null)
                .refundAmount(transaction.getRefundAmount())
                .failureReason(transaction.getFailureReason())
                .build();
    }
}
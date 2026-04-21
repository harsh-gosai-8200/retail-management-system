package com.rms.repository;

import com.rms.model.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends
        JpaRepository<PaymentTransaction, Long>,
        JpaSpecificationExecutor<PaymentTransaction> {

    Optional<PaymentTransaction> findByRazorpayPaymentId(String razorpayPaymentId);
    Optional<PaymentTransaction> findByOrderId(Long orderId);
}
package com.rms.specification;

import com.rms.model.PaymentTransaction;
import com.rms.model.enums.PaymentStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

public class PaymentTransactionSpecification {

    public static Specification<PaymentTransaction> bySellerId(Long sellerId) {
        return (root, query, cb) -> {
            if (sellerId == null) return cb.conjunction();
            return cb.equal(root.get("order").get("seller").get("id"), sellerId);
        };
    }

    public static Specification<PaymentTransaction> byUserId(Long userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("order").get("seller").get("user").get("id"), userId);
        };
    }

    public static Specification<PaymentTransaction> byWholesalerId(Long wholesalerId) {
        return (root, query, cb) -> {
            if (wholesalerId == null) return cb.conjunction();
            return cb.equal(root.get("order").get("wholesaler").get("id"), wholesalerId);
        };
    }

    public static Specification<PaymentTransaction> byStatus(PaymentStatus status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<PaymentTransaction> byPaymentMethod(String paymentMethod) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(paymentMethod)) return cb.conjunction();
            return cb.equal(root.get("paymentMethod"), paymentMethod);
        };
    }

    public static Specification<PaymentTransaction> byDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate == null && endDate == null) {
                return cb.conjunction();
            }
            if (startDate != null && endDate != null) {
                return cb.between(root.get("createdAt"), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), startDate);
            } else if (endDate != null) {
                return cb.lessThanOrEqualTo(root.get("createdAt"), endDate);
            }
            return cb.conjunction();
        };
    }
}
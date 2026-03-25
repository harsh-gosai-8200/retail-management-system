package com.rms.specification;

import com.rms.model.Invoice;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;

public class InvoiceSpecification {

    public static Specification<Invoice> bySellerId(Long sellerId) {
        return (root, query, cb) -> cb.equal(root.get("order").get("seller").get("id"), sellerId);
    }

    public static Specification<Invoice> byStatus(String status) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(status)) return cb.conjunction();
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Invoice> byInvoiceNumber(String invoiceNumber) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(invoiceNumber)) return cb.conjunction();
            return cb.like(cb.lower(root.get("invoiceNumber")), "%" + invoiceNumber.toLowerCase() + "%");
        };
    }

    public static Specification<Invoice> byOrderNumber(String orderNumber) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(orderNumber)) return cb.conjunction();
            return cb.like(cb.lower(root.get("order").get("orderNumber")), "%" + orderNumber.toLowerCase() + "%");
        };
    }

    public static Specification<Invoice> byDateRange(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("generatedAt"), startDate.atStartOfDay()));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("generatedAt"), endDate.atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Invoice> byAmountRange(Double minAmount, Double maxAmount) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalAmount"), minAmount));
            }
            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalAmount"), maxAmount));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Invoice> search(String searchTerm) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(searchTerm)) return cb.conjunction();

            String pattern = "%" + searchTerm.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("invoiceNumber")), pattern),
                    cb.like(cb.lower(root.get("order").get("orderNumber")), pattern)
            );
        };
    }

    public static Specification<Invoice> byWholesalerId(Long wholesalerId) {
        return (root, query, cb) -> cb.equal(root.get("order").get("wholesaler").get("id"), wholesalerId);
    }

    public static Specification<Invoice> withWholesalerFilters(
            Long wholesalerId,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (wholesalerId != null) {
                predicates.add(cb.equal(root.get("order").get("wholesaler").get("id"), wholesalerId));
            }

            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("invoiceNumber")), pattern),
                        cb.like(cb.lower(root.get("order").get("orderNumber")), pattern),
                        cb.like(cb.lower(root.get("order").get("seller").get("shopName")), pattern)
                ));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("generatedAt"), startDate.atStartOfDay()));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("generatedAt"), endDate.atTime(LocalTime.MAX)));
            }

            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalAmount"), minAmount));
            }
            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalAmount"), maxAmount));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Invoice> withFilters(
            Long sellerId,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (sellerId != null) {
                predicates.add(cb.equal(root.get("order").get("seller").get("id"), sellerId));
            }

            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("invoiceNumber")), pattern),
                        cb.like(cb.lower(root.get("order").get("orderNumber")), pattern)
                ));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("generatedAt"), startDate.atStartOfDay()));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("generatedAt"), endDate.atTime(LocalTime.MAX)));
            }

            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("totalAmount"), minAmount));
            }
            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("totalAmount"), maxAmount));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
package com.rms.specification;

import com.rms.model.Order;
import com.rms.model.enums.OrderStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class SalesmanOrderSpecification {

    private SalesmanOrderSpecification() {}

    public static Specification<Order> bySellerIds(List<Long> sellerIds) {
        return (root, query, cb) -> {
            if (sellerIds == null || sellerIds.isEmpty()) {
                return cb.disjunction();
            }
            return root.get("seller").get("id").in(sellerIds);
        };
    }

    public static Specification<Order> byStatus(String status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("status"), OrderStatus.valueOf(status));
        };
    }

    public static Specification<Order> byStatusIn(List<String> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            List<OrderStatus> orderStatuses = statuses.stream()
                    .map(OrderStatus::valueOf)
                    .collect(java.util.stream.Collectors.toList());
            return root.get("status").in(orderStatuses);
        };
    }

    public static Specification<Order> byDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate == null && endDate == null) return cb.conjunction();
            if (startDate != null && endDate != null) {
                return cb.between(root.get("createdAt"), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), startDate);
            } else {
                return cb.lessThanOrEqualTo(root.get("createdAt"), endDate);
            }
        };
    }

    public static Specification<Order> pendingForDelivery() {
        return byStatusIn(List.of("APPROVED", "PROCESSING", "SHIPPED"));
    }

    public static Specification<Order> deliveredOn(LocalDate date) {
        return (root, query, cb) -> {
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
            return cb.between(root.get("deliveredAt"), startOfDay, endOfDay);
        };
    }

    public static Specification<Order> bySellerId(Long sellerId) {
        return (root, query, cb) ->
                cb.equal(root.get("seller").get("id"), sellerId);
    }

    public static Specification<Order> withFilters(
            List<Long> sellerIds,
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (sellerIds != null && !sellerIds.isEmpty()) {
                predicates.add(root.get("seller").get("id").in(sellerIds));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), OrderStatus.valueOf(status)));
            }

            if (startDate != null && endDate != null) {
                predicates.add(cb.between(root.get("createdAt"), startDate, endDate));
            } else if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            } else if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            // Default ordering by createdAt desc
            query.orderBy(cb.desc(root.get("createdAt")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
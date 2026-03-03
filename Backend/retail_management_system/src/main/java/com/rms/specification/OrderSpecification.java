// File: src/main/java/com/rms/specification/OrderSpecification.java
package com.rms.specification;

import com.rms.model.Order;
import com.rms.model.OrderStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    public static Specification<Order> bySellerId(Long sellerId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("seller").get("id"), sellerId);
    }


    public static Specification<Order> byStatus(OrderStatus status) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"), status);
    }


    public static Specification<Order> search(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String pattern = "%" + searchTerm.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("orderNumber")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("seller").get("shopName")), pattern)
            );
        };
    }


    public static Specification<Order> pendingOrders() {
        return byStatus(OrderStatus.PENDING);
    }


    public static Specification<Order> deliveredOrders() {
        return byStatus(OrderStatus.DELIVERED);
    }


    public static Specification<Order> withFilters(
            Long sellerId,
            Long wholesalerId,
            OrderStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String searchTerm) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (sellerId != null) {
                predicates.add(criteriaBuilder.equal(root.get("seller").get("id"), sellerId));
            }

            if (wholesalerId != null) {
                predicates.add(criteriaBuilder.equal(root.get("wholesaler").get("id"), wholesalerId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (startDate != null && endDate != null) {
                predicates.add(criteriaBuilder.between(root.get("createdAt"), startDate, endDate));
            }

            if (StringUtils.hasText(searchTerm)) {
                String pattern = "%" + searchTerm.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("orderNumber")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("seller").get("shopName")), pattern)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
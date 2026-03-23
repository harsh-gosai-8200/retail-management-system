// File: src/main/java/com/rms/specification/OrderSpecification.java
package com.rms.specification;

import com.rms.model.Order;
import com.rms.model.enums.OrderStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.rms.constants.Constants.*;

public class OrderSpecification {

    public static Specification<Order> byWholesalerId(Long wholesalerId) {
        return (root, query, cb) -> {
            if (wholesalerId == null) return cb.conjunction();
            return cb.equal(root.get(WHOLESALER).get(ID), wholesalerId);
        };
    }

    public static Specification<Order> byDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (startDate == null || endDate == null) return cb.conjunction();
            return cb.between(root.get(CREATED_AT), startDate, endDate);
        };
    }

    public static Specification<Order> bySellerId(Long sellerId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get(SELLER).get(ID), sellerId);
    }


    public static Specification<Order> byStatus(OrderStatus status) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get(STATUS), status);
    }


    public static Specification<Order> search(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            String pattern = "%" + searchTerm.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get(ORDER_NUMBER)), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get(SELLER).get(SHOPNAME)), pattern)
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
                predicates.add(criteriaBuilder.equal(root.get(SELLER).get(ID), sellerId));
            }

            if (wholesalerId != null) {
                predicates.add(criteriaBuilder.equal(root.get(WHOLESALER).get(ID), wholesalerId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get(STATUS), status));
            }

            if (startDate != null && endDate != null) {
                predicates.add(criteriaBuilder.between(root.get(CREATED_AT), startDate, endDate));
            }

            if (StringUtils.hasText(searchTerm)) {
                String pattern = "%" + searchTerm.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get(ORDER_NUMBER)), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get(SELLER).get(SHOPNAME)), pattern)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
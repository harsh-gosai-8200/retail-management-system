package com.rms.specification;

import com.rms.model.SystemLog;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

public class SystemLogSpecification {

    public static Specification<SystemLog> byUserId(Long userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<SystemLog> byAction(String action) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(action)) return cb.conjunction();
            return cb.like(cb.lower(root.get("action")), "%" + action.toLowerCase() + "%");
        };
    }

    public static Specification<SystemLog> byDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> {
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

    public static Specification<SystemLog> withFilters(Long userId, String action, LocalDateTime startDate, LocalDateTime endDate) {
        return Specification.where(byUserId(userId))
                .and(byAction(action))
                .and(byDateRange(startDate, endDate));
    }
}
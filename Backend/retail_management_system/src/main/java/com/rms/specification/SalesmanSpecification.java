package com.rms.specification;

import com.rms.model.Salesman;
import com.rms.model.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class SalesmanSpecification {

    private SalesmanSpecification() {}

    public static Specification<Salesman> byWholesalerId(Long wholesalerId) {
        return (root, query, cb) ->
                cb.equal(root.get("wholesaler").get("id"), wholesalerId);
    }

    public static Specification<Salesman> byUserId(Long userId) {
        return (root, query, cb) ->
                cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<Salesman> byEmployeeId(String employeeId) {
        return (root, query, cb) ->
                cb.equal(root.get("employeeId"), employeeId);
    }

    public static Specification<Salesman> byEmail(String email) {
        return (root, query, cb) -> {
            Join<Salesman, User> userJoin = root.join("user");
            return cb.equal(userJoin.get("email"), email);
        };
    }

    public static Specification<Salesman> byStatus(Boolean isActive) {
        return (root, query, cb) -> {
            Join<Salesman, User> userJoin = root.join("user");
            return cb.equal(userJoin.get("isActive"), isActive);
        };
    }

    public static Specification<Salesman> byRegion(String region) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(region)) return cb.conjunction();
            return cb.equal(root.get("region"), region);
        };
    }

    public static Specification<Salesman> byDepartment(String department) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(department)) return cb.conjunction();
            return cb.equal(root.get("department"), department);
        };
    }

    public static Specification<Salesman> search(String searchTerm) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(searchTerm)) {
                return cb.conjunction();
            }

            String pattern = "%" + searchTerm.toLowerCase() + "%";
            Join<Salesman, User> userJoin = root.join("user");

            return cb.or(
                    cb.like(cb.lower(root.get("fullName")), pattern),
                    cb.like(cb.lower(root.get("employeeId")), pattern),
                    cb.like(cb.lower(userJoin.get("email")), pattern),
                    cb.like(cb.lower(userJoin.get("phone")), pattern)
            );
        };
    }

    public static Specification<Salesman> existsByEmployeeId(String employeeId) {
        return (root, query, cb) -> {
            query.distinct(true);
            return cb.equal(root.get("employeeId"), employeeId);
        };
    }

    public static Specification<Salesman> existsByEmail(String email) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Salesman, User> userJoin = root.join("user");
            return cb.equal(userJoin.get("email"), email);
        };
    }

    public static Specification<Salesman> withFilters(
            Long wholesalerId,
            String searchTerm,
            Boolean isActive,
            String region,
            String department) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<Salesman, User> userJoin = root.join("user");

            if (wholesalerId != null) {
                predicates.add(cb.equal(root.get("wholesaler").get("id"), wholesalerId));
            }

            if (isActive != null) {
                predicates.add(cb.equal(userJoin.get("isActive"), isActive));
            }

            if (StringUtils.hasText(region)) {
                predicates.add(cb.equal(root.get("region"), region));
            }

            if (StringUtils.hasText(department)) {
                predicates.add(cb.equal(root.get("department"), department));
            }

            if (StringUtils.hasText(searchTerm)) {
                String pattern = "%" + searchTerm.toLowerCase() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("employeeId")), pattern),
                        cb.like(cb.lower(userJoin.get("email")), pattern),
                        cb.like(cb.lower(userJoin.get("phone")), pattern)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
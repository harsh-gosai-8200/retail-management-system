package com.rms.specification;

import com.rms.model.SalesmanAssignment;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.rms.constants.Constants.*;

public class SalesmanAssignmentSpecification {

    private SalesmanAssignmentSpecification() {}

    public static Specification<SalesmanAssignment> bySalesmanId(Long salesmanId) {
        return (root, query, cb) ->
                cb.equal(root.get(SALESMAN).get(ID), salesmanId);
    }

    public static Specification<SalesmanAssignment> bySellerId(Long sellerId) {
        return (root, query, cb) ->
                cb.equal(root.get(SELLER).get(ID), sellerId);
    }

    public static Specification<SalesmanAssignment> byWholesalerId(Long wholesalerId) {
        return (root, query, cb) ->
                cb.equal(root.get(WHOLESALER).get(ID), wholesalerId);
    }

    public static Specification<SalesmanAssignment> byStatus(String status) {
        return (root, query, cb) ->
                cb.equal(root.get(STATUS), status);
    }

    public static Specification<SalesmanAssignment> activeOnly() {
        return byStatus("ACTIVE");
    }

    public static Specification<SalesmanAssignment> byAssignedAfter(LocalDateTime date) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("assignedAt"), date);
    }

    public static Specification<SalesmanAssignment> byAssignedBefore(LocalDateTime date) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("assignedAt"), date);
    }

    public static Specification<SalesmanAssignment> byAssignedBetween(LocalDateTime start, LocalDateTime end) {
        return (root, query, cb) ->
                cb.between(root.get("assignedAt"), start, end);
    }

    public static Specification<SalesmanAssignment> withFilters(
            Long salesmanId,
            Long sellerId,
            Long wholesalerId,
            String status,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (salesmanId != null) {
                predicates.add(cb.equal(root.get(SALESMAN).get(ID), salesmanId));
            }

            if (sellerId != null) {
                predicates.add(cb.equal(root.get(SELLER).get(ID), sellerId));
            }

            if (wholesalerId != null) {
                predicates.add(cb.equal(root.get(WHOLESALER).get(ID), wholesalerId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get(STATUS), status));
            }

            if (startDate != null && endDate != null) {
                predicates.add(cb.between(root.get("assignedAt"), startDate, endDate));
            } else if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("assignedAt"), startDate));
            } else if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("assignedAt"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

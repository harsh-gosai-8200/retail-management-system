package com.rms.specification;

import com.rms.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

import static com.rms.constants.Constants.*;

public class ProductSpecification {


    /**
     * Filter by wholesaler ID
     */
    public static Specification<Product> byWholesalerId(Long wholesalerId) {
        return (root, query, cb) -> {
            if (wholesalerId == null) return cb.conjunction();
            return cb.equal(root.get(WHOLESALER).get(ID), wholesalerId);
        };
    }

    /**
     * Filter by low stock (stock less than or equal to threshold)
     */
    public static Specification<Product> lowStock(int threshold) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get(STOCK_QUENTITY), threshold);
    }

    /**
     * Filter by out of stock (stock quantity = 0)
     */
    public static Specification<Product> outOfStock() {
        return (root, query, cb) ->
                cb.equal(root.get(STOCK_QUENTITY), 0);
    }

    /**
     * Build dynamic query based on filters
     * This SINGLE method replaces ALL custom query methods
     */
    public static Specification<Product> withFilters(
            Long wholesalerId,
            String category,
            String searchTerm,
            Boolean isActive) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by wholesaler
            if (wholesalerId != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get(WHOLESALER).get(ID), wholesalerId));
            }

//            // Filter by category
//            if (StringUtils.hasText(category)) {
//                predicates.add(criteriaBuilder.equal(
//                        root.get("category"), category));
//            }

            // Filter by category case-insensitively
            if (StringUtils.hasText(category)) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get(CATEGORY)),
                        category.toLowerCase()
                ));
            }

            // Filter by active status (default to true if not specified)
            if (isActive != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get(IS_ACTIVE), isActive));
            }
//            else {
//                predicates.add(criteriaBuilder.isTrue(root.get("isActive")));
//            }

            // Search in name, description, and skuCode
            if (StringUtils.hasText(searchTerm)) {
                String pattern = "%" + searchTerm.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get(NAME)), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get(DESCRIPTION)), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get(SKU_CODE)), pattern)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Get distinct categories for a wholesaler
     */
    public static Specification<Product> distinctCategories(Long wholesalerId) {
        return (root, query, criteriaBuilder) -> {
            query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(
                    root.get(WHOLESALER).get(ID), wholesalerId));
            predicates.add(criteriaBuilder.isTrue(root.get(IS_ACTIVE)));
            predicates.add(criteriaBuilder.isNotNull(root.get(CATEGORY)));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
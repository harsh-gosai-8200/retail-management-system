package com.rms.specification;

import com.rms.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {


    /**
     * Filter by wholesaler ID
     */
    public static Specification<Product> byWholesalerId(Long wholesalerId) {
        return (root, query, cb) -> {
            if (wholesalerId == null) return cb.conjunction();
            return cb.equal(root.get("wholesaler").get("id"), wholesalerId);
        };
    }

    /**
     * Filter by low stock (stock less than or equal to threshold)
     */
    public static Specification<Product> lowStock(int threshold) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("stockQuantity"), threshold);
    }

    /**
     * Filter by out of stock (stock quantity = 0)
     */
    public static Specification<Product> outOfStock() {
        return (root, query, cb) ->
                cb.equal(root.get("stockQuantity"), 0);
    }

    /**
     * Filter by active products only
     */
    public static Specification<Product> activeOnly() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    /**
     * Filter by category
     */
    public static Specification<Product> byCategory(String category) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(category)) return cb.conjunction();
            return cb.equal(cb.lower(root.get("category")), category.toLowerCase());
        };
    }

    /**
     * Filter by price range
     */
    public static Specification<Product> priceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("price"), minPrice, maxPrice);
            } else if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
            } else if (maxPrice != null) {
                return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
            }
            return cb.conjunction();
        };
    }

    /**
     * Search by name, description, or SKU
     */
    public static Specification<Product> search(String searchTerm) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(searchTerm)) return cb.conjunction();

            String pattern = "%" + searchTerm.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("skuCode")), pattern)
            );
        };
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
                        root.get("wholesaler").get("id"), wholesalerId));
            }

//            // Filter by category
//            if (StringUtils.hasText(category)) {
//                predicates.add(criteriaBuilder.equal(
//                        root.get("category"), category));
//            }

            // Filter by category case-insensitively
            if (StringUtils.hasText(category)) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("category")),
                        category.toLowerCase()
                ));
            }

            // Filter by active status (default to true if not specified)
            if (isActive != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("isActive"), isActive));
            }
//            else {
//                predicates.add(criteriaBuilder.isTrue(root.get("isActive")));
//            }

            // Search in name, description, and skuCode
            if (StringUtils.hasText(searchTerm)) {
                String pattern = "%" + searchTerm.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("skuCode")), pattern)
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
                    root.get("wholesaler").get("id"), wholesalerId));
            predicates.add(criteriaBuilder.isTrue(root.get("isActive")));
            predicates.add(criteriaBuilder.isNotNull(root.get("category")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
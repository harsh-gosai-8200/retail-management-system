package com.rms.specification;

import com.rms.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

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
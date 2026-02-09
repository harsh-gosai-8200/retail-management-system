package com.rms.retail_management_system.repository;

import com.rms.retail_management_system.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Method 1: Using derived query (Spring will create the query automatically)
    Page<Product> findByWholesalerIdAndIsActive(Long wholesalerId, Boolean isActive, Pageable pageable);

    // For active products only, we need a custom query or use default parameter
    default Page<Product> findByWholesalerIdAndIsActiveTrue(Long wholesalerId, Pageable pageable) {
        return findByWholesalerIdAndIsActive(wholesalerId, true, pageable);
    }

    // Method 2: Derived query for category
    Page<Product> findByWholesalerIdAndCategoryAndIsActive(Long wholesalerId, String category, Boolean isActive, Pageable pageable);

    default Page<Product> findByWholesalerIdAndCategoryAndIsActiveTrue(Long wholesalerId, String category, Pageable pageable) {
        return findByWholesalerIdAndCategoryAndIsActive(wholesalerId, category, true, pageable);
    }

    // Method 3: Search still needs custom query for LIKE operation
    @Query("SELECT p FROM Product p WHERE p.wholesaler.id = :wholesalerId " +
            "AND p.isActive = true " +
            "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(p.skuCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Product> searchProducts(@Param("wholesalerId") Long wholesalerId,
                                 @Param("searchTerm") String searchTerm,
                                 Pageable pageable);

    // Method 4: Find all distinct categories for a wholesaler
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.wholesaler.id = :wholesalerId AND p.isActive = true AND p.category IS NOT NULL")
    List<String> findDistinctCategoriesByWholesalerId(@Param("wholesalerId") Long wholesalerId);

    // Method 5: Check if SKU code already exists (excluding current product)
    Optional<Product> findBySkuCodeAndIdNot(String skuCode, Long id);

    // Method 6: Check if SKU code exists
    boolean existsBySkuCode(String skuCode);

    // Additional derived queries
    List<Product> findByWholesalerIdAndIsActiveTrue(Long wholesalerId);

    Optional<Product> findByIdAndWholesalerIdAndIsActiveTrue(Long id, Long wholesalerId);

    long countByWholesalerIdAndIsActiveTrue(Long wholesalerId);

    Page<Product> findByWholesalerIdAndStockQuantityLessThanEqualAndIsActiveTrue(Long wholesalerId, Integer stockQuantity, Pageable pageable);
}
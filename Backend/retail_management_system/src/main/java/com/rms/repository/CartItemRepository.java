
package com.rms.repository;

import com.rms.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface CartItemRepository extends
        JpaRepository<CartItem, Long>,
        JpaSpecificationExecutor<CartItem> {

    Optional<CartItem> findBySellerIdAndProductId(Long sellerId, Long productId);

    long countBySellerId(Long sellerId);

    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.seller.id = :sellerId")
    void deleteBySellerId(@Param("sellerId") Long sellerId);
}
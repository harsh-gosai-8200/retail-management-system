
package com.rms.repository;

import com.rms.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface OrderRepository extends
        JpaRepository<Order, Long>,
        JpaSpecificationExecutor<Order> {

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.seller.id = :sellerId AND o.status = 'DELIVERED'")
    BigDecimal getTotalSpentBySeller(@Param("sellerId") Long sellerId);

}
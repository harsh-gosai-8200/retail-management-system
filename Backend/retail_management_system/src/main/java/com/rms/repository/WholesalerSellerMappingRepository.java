package com.rms.repository;

import com.rms.model.SubscriptionStatus;
import com.rms.model.WholesalerSellerMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WholesalerSellerMappingRepository
        extends JpaRepository<WholesalerSellerMapping, Long> {

    // For Local Seller side
    List<WholesalerSellerMapping>
    findByLocalSeller_IdAndStatus(Long localSellerId, SubscriptionStatus status);

    // For Wholesaler side
    List<WholesalerSellerMapping>
    findByWholesaler_IdAndStatus(Long wholesalerId, SubscriptionStatus status);

    // For checking existing mapping
    WholesalerSellerMapping
    findByLocalSeller_IdAndWholesaler_Id(Long localSellerId, Long wholesalerId);

    boolean existsByLocalSeller_IdAndWholesaler_IdAndStatus(
            Long localSellerId,
            Long wholesalerId,
            SubscriptionStatus status
    );
}
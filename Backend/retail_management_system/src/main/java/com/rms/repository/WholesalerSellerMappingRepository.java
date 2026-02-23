package com.rms.repository;

import com.rms.model.WholesalerSellerMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WholesalerSellerMappingRepository
        extends JpaRepository<WholesalerSellerMapping, Long> {

    List<WholesalerSellerMapping>
    findByLocalSeller_IdAndStatus(Long localSellerId, String status);
}
package com.rms.service;

import com.rms.dto.ProductDTO;
import com.rms.dto.WholesalerDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LocalSellerService {

    // Get all active wholesalers
    List<WholesalerDTO> getActiveWholesalers();

    // Get all active products of a wholesaler
    List<ProductDTO> getActiveProductsByWholesaler(Long wholesalerId);

    // Get only subscribed (mapped) wholesalers of a local seller
    List<WholesalerDTO> getSubscriptedWholesalers(Long localSellerId);

    // Get products of a mapped wholesaler (paginated)
    Page<ProductDTO> getProductsOfWholesaler(Long localSellerId, Long wholesalerId, Pageable pageable);
}
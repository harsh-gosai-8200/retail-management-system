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
    Page<WholesalerDTO> getSubscribedWholesalers(Long localSellerId, Pageable pageable);

    // Get products of a mapped wholesaler (paginated)
    Page<ProductDTO> getProductsOfWholesaler(Long localSellerId, Long wholesalerId, Pageable pageable);


    void subscribeWholesaler(Long localSellerId, Long wholesalerId);

    void unsubscribeWholesaler(Long localSellerId, Long wholesalerId);

    List<ProductDTO> getAllProductsForSeller();
}
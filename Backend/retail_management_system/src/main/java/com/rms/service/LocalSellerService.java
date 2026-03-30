package com.rms.service;

import com.rms.dto.ProductDTO;
import com.rms.dto.SellerDTO;
import com.rms.dto.UpdateSellerDTO;
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


    SellerDTO getSellerProfile(Long userId);

    SellerDTO updateSellerProfile(Long userId, UpdateSellerDTO dto);


    List<ProductDTO> getAllProductsForSeller(String city);

    List<WholesalerDTO> getWholesalersByCity(String city);

    List<ProductDTO> getProductsByWholesalerIfServesCity(Long wholesalerId, String city);
}
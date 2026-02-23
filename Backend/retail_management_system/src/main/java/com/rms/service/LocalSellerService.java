package com.rms.service;

import com.rms.dto.ProductDTO;
import com.rms.dto.WholesalerDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LocalSellerService {

    List<WholesalerDTO> getActiveWholesalers();

    List<ProductDTO> getActiveProductsByWholesaler(Long wholesalerId);


    List<WholesalerDTO> getMappedWholesalers(Long localSellerId);

    Page<?> getProductsOfWholesaler(
            Long localSellerId,
            Long wholesalerId,
            Pageable pageable
    );

}
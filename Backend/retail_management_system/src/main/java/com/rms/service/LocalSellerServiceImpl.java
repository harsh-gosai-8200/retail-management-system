package com.rms.service;

import com.rms.dto.ProductDTO;
import com.rms.dto.WholesalerDTO;
import com.rms.model.WholesalerSellerMapping;
import com.rms.repository.ProductRepository;
import com.rms.repository.WholesalerRepository;
import com.rms.repository.WholesalerSellerMappingRepository;
import com.rms.service.LocalSellerService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocalSellerServiceImpl implements LocalSellerService {

    private final WholesalerRepository wholesalerRepository;
    private final ProductRepository productRepository;
    private final WholesalerSellerMappingRepository mappingRepository;
    private final ModelMapper modelMapper;

    //  1. All active wholesalers (optional feature)
    @Override
    public List<WholesalerDTO> getActiveWholesalers() {
        return wholesalerRepository.findByIsActiveTrue()
                .stream()
                .map(w -> modelMapper.map(w, WholesalerDTO.class))
                .collect(Collectors.toList());
    }

    //  All active products of wholesaler
    @Override
    public List<ProductDTO> getActiveProductsByWholesaler(Long wholesalerId) {
        return productRepository
                .findByWholesalerIdAndIsActiveTrue(wholesalerId)
                .stream()
                .map(p -> modelMapper.map(p, ProductDTO.class))
                .collect(Collectors.toList());
    }

    //  ONLY MAPPED WHOLESALERS
    @Override
    public List<WholesalerDTO> getMappedWholesalers(Long localSellerId) {

        List<WholesalerSellerMapping> mappings =
                mappingRepository.findByLocalSeller_IdAndStatus(
                        localSellerId,
                        "APPROVED"
                );

        return mappings.stream()
                .map(mapping -> modelMapper.map(
                        mapping.getWholesaler(),
                        WholesalerDTO.class
                ))
                .collect(Collectors.toList());
    }

    // 4. Products of ONLY mapped wholesaler
    @Override
    public Page<ProductDTO> getProductsOfWholesaler(
            Long localSellerId,
            Long wholesalerId,
            Pageable pageable) {

        // First check if mapping exists
        boolean isMapped =
                mappingRepository
                        .findByLocalSeller_IdAndStatus(localSellerId, "APPROVED")
                        .stream()
                        .anyMatch(m -> m.getWholesaler().getId().equals(wholesalerId));

        if (!isMapped) {
            throw new RuntimeException("Wholesaler not mapped to this local seller");
        }

        return productRepository
                .findByWholesalerIdAndIsActiveTrue(wholesalerId, pageable)
                .map(product -> modelMapper.map(product, ProductDTO.class));
    }
}
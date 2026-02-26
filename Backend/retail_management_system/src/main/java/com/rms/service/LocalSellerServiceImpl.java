package com.rms.service;

import com.rms.dto.ProductDTO;
import com.rms.dto.WholesalerDTO;
import com.rms.model.Product;
import com.rms.model.WholesalerSellerMapping;
import com.rms.repository.ProductRepository;
import com.rms.repository.WholesalerRepository;
import com.rms.repository.WholesalerSellerMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocalSellerServiceImpl implements LocalSellerService {

    private final WholesalerRepository wholesalerRepository;
    private final ProductRepository productRepository;
    private final WholesalerSellerMappingRepository mappingRepository;
    private final ModelMapper modelMapper;

    // Get all active wholesalers
    @Override
    public List<WholesalerDTO> getActiveWholesalers() {
        log.info("Fetching all active wholesalers");
        return wholesalerRepository.findByIsActiveTrue()
                .stream()
                .map(w -> modelMapper.map(w, WholesalerDTO.class))
                .collect(Collectors.toList());
    }

    // Get all active products of a wholesaler
    @Override
    public List<ProductDTO> getActiveProductsByWholesaler(Long wholesalerId) {
        log.info("Fetching all active products for wholesaler ID: {}", wholesalerId);
        return productRepository
                .findByWholesalerIdAndIsActiveTrue(wholesalerId)
                .stream()
                .map(p -> modelMapper.map(p, ProductDTO.class))
                .collect(Collectors.toList());
    }

    //  Get only subscribed (mapped) wholesalers
    @Override
    public List<WholesalerDTO> getSubscriptedWholesalers(Long localSellerId) {
        log.info("Fetching subscribed wholesalers for local seller ID: {}", localSellerId);
        List<WholesalerSellerMapping> mappings =
                mappingRepository.findByLocalSeller_IdAndStatus(localSellerId, "APPROVED");

        return mappings.stream()
                .map(mapping -> modelMapper.map(mapping.getWholesaler(), WholesalerDTO.class))
                .collect(Collectors.toList());
    }

    //  Get products of a mapped wholesaler (paginated)
    @Override
    public Page<ProductDTO> getProductsOfWholesaler(Long localSellerId, Long wholesalerId, Pageable pageable) {

        log.info("Fetching paginated products for local seller ID: {}, wholesaler ID: {}", localSellerId, wholesalerId);
        // Check if wholesaler is mapped to local seller
        boolean isMapped = mappingRepository
                .findByLocalSeller_IdAndStatus(localSellerId, "APPROVED")
                .stream()
                .anyMatch(m -> m.getWholesaler().getId().equals(wholesalerId));

        if (!isMapped) {
            throw new RuntimeException("Wholesaler not mapped to this local seller");
        }

        // Fetch paginated products
        Page<Product> productPage = productRepository
                .findByWholesalerIdAndIsActiveTrue(wholesalerId, pageable);

        // Convert Page<Product> → Page<ProductDTO>
        return productPage.map(product -> modelMapper.map(product, ProductDTO.class));
    }
}
package com.rms.service;

import com.rms.dto.ProductDTO;
import com.rms.dto.WholesalerDTO;
import com.rms.model.*;
import com.rms.repository.*;
import jakarta.transaction.Transactional;
import lombok.Builder;
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
@Transactional

public class LocalSellerServiceImpl implements LocalSellerService {

    private final WholesalerRepository wholesalerRepository;
    private final ProductRepository productRepository;
    private final WholesalerSellerMappingRepository mappingRepository;
    private final ModelMapper modelMapper;
    private final LocalSellerRepository localSellerRepository;


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
    public List<WholesalerDTO> getSubscribedWholesalers(Long localSellerId) {
        log.info("Fetching subscribed wholesalers for local seller ID: {}", localSellerId);
        List<WholesalerSellerMapping> mappings =
                mappingRepository.findByLocalSeller_IdAndStatus(localSellerId, SubscriptionStatus.APPROVED);

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
                .findByLocalSeller_IdAndStatus(localSellerId, SubscriptionStatus.APPROVED)
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

    // subscribe wholesaler

    @Override
    public void subscribeWholesaler(Long localSellerId, Long wholesalerId) {
        log.info("Subscribing local seller ID {} to wholesaler ID {}", localSellerId, wholesalerId);

        // Fetch local seller and wholesaler from DB
        LocalSeller localSeller = localSellerRepository.findById(localSellerId)
                .orElseThrow(() -> new RuntimeException("Local seller not found"));

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new RuntimeException("Wholesaler not found"));

        //  Check if mapping already exists
        WholesalerSellerMapping existingMapping =
                mappingRepository.findByLocalSeller_IdAndWholesaler_Id(localSellerId, wholesalerId);

        if (existingMapping != null) {
            SubscriptionStatus status = existingMapping.getStatus();

            if (SubscriptionStatus.APPROVED.equals(status)) {
                throw new RuntimeException("Already subscribed to this wholesaler");
            }

            if (SubscriptionStatus.PENDING.equals(status)) {
                throw new RuntimeException("Subscription request already pending");
            }

            // If previously REJECTED or INACTIVE, set to PENDING
            existingMapping.setStatus(SubscriptionStatus.PENDING);
            mappingRepository.save(existingMapping);
            return;
        }

        //  Create new mapping
        WholesalerSellerMapping mapping = new WholesalerSellerMapping();
        mapping.setLocalSeller(localSeller);
        mapping.setWholesaler(wholesaler);
        mapping.setStatus(SubscriptionStatus.PENDING);
        mappingRepository.save(mapping);
    }

    @Override
    public void unsubscribeWholesaler(Long localSellerId, Long wholesalerId) {

        log.info("Unsubscribing local seller ID {} from wholesaler ID {}", localSellerId, wholesalerId);

        WholesalerSellerMapping mapping =
                mappingRepository.findByLocalSeller_IdAndWholesaler_Id(localSellerId, wholesalerId);

        if (mapping == null) {
            throw new RuntimeException("Subscription not found");
        }

        if (!(SubscriptionStatus.APPROVED).equals(mapping.getStatus())) {
            throw new RuntimeException("Cannot unsubscribe. Subscription not approved.");
        }

        mapping.setStatus(SubscriptionStatus.INACTIVE);
        mappingRepository.save(mapping);
    }
}
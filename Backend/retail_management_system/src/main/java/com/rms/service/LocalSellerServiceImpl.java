package com.rms.service;

import com.rms.constants.MessageKeys;
import com.rms.dto.ProductDTO;
import com.rms.dto.SellerDTO;
import com.rms.dto.UpdateSellerDTO;
import com.rms.dto.WholesalerDTO;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.*;
import com.rms.model.enums.SubscriptionStatus;
import com.rms.repository.*;
import com.rms.specification.ProductSpecification;
import com.rms.specification.WholesalerSellerSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    private final MessageService messageService;


    // Get all active wholesalers
    @Override
    public List<WholesalerDTO> getActiveWholesalers() {
        log.info("Fetching all active wholesalers");

        return wholesalerRepository.findByIsActiveTrue()
                .stream()
                .map(this::fromEntity)
                .collect(Collectors.toList());
    }

    // Get all active products of a wholesaler
    @Override
    public List<ProductDTO> getActiveProductsByWholesaler(Long wholesalerId) {

        if (!wholesalerRepository.existsById(wholesalerId)) {
            throw new ResourceNotFoundException(messageService.get(MessageKeys.WHOLESALER_NOT_FOUND));
        }
        log.info("Fetching all active products for wholesaler ID: {}", wholesalerId);

        if (!wholesalerRepository.existsById(wholesalerId)) {
            throw new RuntimeException(messageService.get(MessageKeys.WHOLESALER_NOT_FOUND));
        }

        Specification<Product> spec = ProductSpecification.withFilters(
                wholesalerId, null, null, true
        );

        return productRepository
                .findAll(spec)
                .stream()
                .map(p -> modelMapper.map(p, ProductDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public Page<WholesalerDTO> getSubscribedWholesalers(Long localSellerId, Pageable pageable) {
        log.info("Fetching subscribed wholesalers for local seller ID: {}", localSellerId);

        if (!localSellerRepository.existsById(localSellerId)) {
            throw new ResourceNotFoundException(messageService.get(MessageKeys.LOCAL_SELLER_NOT_FOUND));
        }

        Specification<WholesalerSellerMapping> spec =
                Specification.where(WholesalerSellerSpecification.byLocalSellerId(localSellerId));


        Page<WholesalerSellerMapping> mappings = mappingRepository.findAll(spec, pageable);

        return mappings.map(mapping -> {
            WholesalerDTO dto = modelMapper.map(mapping.getWholesaler(), WholesalerDTO.class);
            dto.setStatus(mapping.getStatus());
            return dto;
        });

    }


    //  Get products of a mapped wholesaler (paginated)
    @Override
    public Page<ProductDTO> getProductsOfWholesaler(Long localSellerId, Long wholesalerId, Pageable pageable) {

        log.info("Fetching paginated products for local seller ID: {}, wholesaler ID: {}", localSellerId, wholesalerId);

        // Check if subscribed
        Specification<WholesalerSellerMapping> subscriptionSpec =
                Specification.where(WholesalerSellerSpecification.byLocalSellerId(localSellerId))
                        .and(WholesalerSellerSpecification.byWholesalerId(wholesalerId))
                        .and(WholesalerSellerSpecification.byStatus(SubscriptionStatus.APPROVED));

        if (!mappingRepository.exists(subscriptionSpec)) {
            throw new ResourceNotFoundException(messageService.get(MessageKeys.WHOLESALER_NOT_MAPPED));
        }

        Specification<Product> productSpec = ProductSpecification.withFilters(
                wholesalerId, null, null, true
        );

        // Fetch paginated products
        Page<Product> productPage = productRepository
                .findAll(productSpec, pageable);

        // Convert Page<Product> → Page<ProductDTO>
        return productPage.map(product -> modelMapper.map(product, ProductDTO.class));
    }

    // subscribe wholesaler

    @Override
    public void subscribeWholesaler(Long localSellerId, Long wholesalerId) {
        log.info("Subscribing local seller ID {} to wholesaler ID {}", localSellerId, wholesalerId);

        // Fetch local seller and wholesaler from DB
        LocalSeller localSeller = localSellerRepository.findById(localSellerId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.get(MessageKeys.LOCAL_SELLER_NOT_FOUND)));

        Wholesaler wholesaler = wholesalerRepository.findById(wholesalerId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.get(MessageKeys.WHOLESALER_NOT_FOUND)));

        // Check if wholesaler is active
        if (!wholesaler.getIsActive()) {
            throw new ResourceNotFoundException(messageService.get(MessageKeys.WHOLESALER_INACTIVE));
        }

        //  Check if mapping already exists
        WholesalerSellerMapping existingMapping =
                mappingRepository.findByLocalSeller_IdAndWholesaler_Id(localSellerId, wholesalerId);

        if (existingMapping != null) {
            SubscriptionStatus status = existingMapping.getStatus();

            if (SubscriptionStatus.APPROVED.equals(status)) {
                throw new RuntimeException(messageService.get(MessageKeys.ALREADY_SUBSCRIBED));
            }

            if (SubscriptionStatus.PENDING.equals(status)) {
                throw new RuntimeException(messageService.get(MessageKeys.SUBSCRIPTION_PENDING));
            }

            if (SubscriptionStatus.REJECTED.equals(status) || SubscriptionStatus.INACTIVE.equals(status)) {
                existingMapping.setStatus(SubscriptionStatus.PENDING);
                mappingRepository.save(existingMapping);
                return;
            }

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
            throw new RuntimeException(messageService.get(MessageKeys.SUBSCRIPTION_NOT_FOUND));
        }

//        if (!SubscriptionStatus.APPROVED.equals(mapping.getStatus())) {
//            throw new RuntimeException(messageService.get(MessageKeys.SUBSCRIPTION_NOT_APPROVED));
//        }

       mapping.setStatus(SubscriptionStatus.INACTIVE);
        mappingRepository.save(mapping);
        log.info("Subscription marked inactive for localSeller {} and wholesaler {}", localSellerId, wholesalerId);
    }

    @Override
    public List<ProductDTO> getAllProductsForSeller() {
        // Step 1: Fetch active products
        List<Product> products = productRepository.findByIsActiveTrue();

        // Step 2: Convert Product -> ProductDTO
        return products.stream()
                .map(product -> modelMapper.map(product, ProductDTO.class))
                .toList();
    }

    @Override
    public SellerDTO getSellerProfile(Long userId) {
        LocalSeller seller = localSellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.get(MessageKeys.LOCAL_SELLER_NOT_FOUND)));

        return mapToDTO(seller);
    }

    public WholesalerDTO fromEntity(Wholesaler wholesaler) {
        return WholesalerDTO.builder()
                .id(wholesaler.getId())
                .businessName(wholesaler.getBusinessName())
                .address(wholesaler.getAddress())
                .gstNumber(wholesaler.getGstNumber())
                .isActive(wholesaler.getIsActive())
                .username(wholesaler.getUser() != null ? wholesaler.getUser().getUsername() : null)
                .build();
    }

    // get profile
    private SellerDTO mapToDTO(LocalSeller seller) {
        return SellerDTO.builder()
                .id(seller.getId())

                // USER fields
                .username(seller.getUser().getUsername())
                .email(seller.getUser().getEmail())
                .phone(seller.getUser().getPhone())

                // SELLER fields
                .shopName(seller.getShopName())
                .address(seller.getAddress())

                .isActive(seller.getUser().getIsActive())
                .build();
    }


    @Override
    public SellerDTO updateSellerProfile(Long userId, UpdateSellerDTO dto) {
        LocalSeller seller = localSellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.get(MessageKeys.LOCAL_SELLER_NOT_FOUND)));

        User user = seller.getUser();

        // Update User fields
        if (dto.getUsername() != null) user.setUsername(dto.getUsername());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getEmail()!=null) user.setEmail(dto.getEmail());

        // Update Seller fields
        if (dto.getShopName() != null) seller.setShopName(dto.getShopName());
        if (dto.getAddress() != null) seller.setAddress(dto.getAddress());

        // Save
        localSellerRepository.save(seller);

        return mapToDTO(seller);
    }
}
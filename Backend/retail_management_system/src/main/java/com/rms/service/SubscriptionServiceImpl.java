package com.rms.service;

import com.rms.constants.MessageKeys;
import com.rms.dto.SubscriptionDTO;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.enums.SubscriptionStatus;
import com.rms.model.WholesalerSellerMapping;
import com.rms.repository.LocalSellerRepository;
import com.rms.repository.WholesalerRepository;
import com.rms.repository.WholesalerSellerMappingRepository;
import com.rms.specification.WholesalerSellerSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SubscriptionServiceImpl implements SubscriptionService {

    private final WholesalerSellerMappingRepository mappingRepository;
    private final ModelMapper modelMapper;
    private final MessageService messageService;
    private final WholesalerRepository wholesalerRepository;
    private final LocalSellerRepository localSellerRepository;

    // ==================== WHOLESALER SIDE ====================

    // Get all pending requests for a wholesaler
    @Override
    public Page<SubscriptionDTO> getPendingRequests(Long wholesalerId, Pageable pageable) {
        log.info("Fetching pending requests for wholesaler: {}", wholesalerId);

        if (!wholesalerRepository.existsById(wholesalerId)) {
            throw new ResourceNotFoundException("Wholesaler not found with ID: " + wholesalerId);
        }

        Specification<WholesalerSellerMapping> spec =
                Specification.where(WholesalerSellerSpecification.byWholesalerId(wholesalerId))
                        .and(WholesalerSellerSpecification.byStatus(SubscriptionStatus.PENDING));

        Page<WholesalerSellerMapping> page = mappingRepository.findAll(spec, pageable);

        return page.map(this::convertToDTO);
    }

    // Approve subscription
    @Override
    public SubscriptionDTO approveSubscription(Long wholesalerId, Long localSellerId) {
        log.info("Approving subscription for wholesaler: {}, seller: {}", wholesalerId, localSellerId);

        WholesalerSellerMapping mapping = findMapping(wholesalerId, localSellerId);

        if (mapping.getStatus() != SubscriptionStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only pending requests can be approved. Current status: " + mapping.getStatus()
            );
        }

        mapping.setStatus(SubscriptionStatus.APPROVED);
        WholesalerSellerMapping saved = mappingRepository.save(mapping);

        return convertToDTO(saved, messageService.get(MessageKeys.SUBSCRIPTION_APPROVED));
    }

    // Reject subscription
    @Override
    public SubscriptionDTO rejectSubscription(Long wholesalerId, Long localSellerId) {
        log.info("Rejecting subscription for wholesaler: {}, seller: {}", wholesalerId, localSellerId);

        WholesalerSellerMapping mapping = findMapping(wholesalerId, localSellerId);

        if (mapping.getStatus() != SubscriptionStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only pending requests can be rejected. Current status: " + mapping.getStatus()
            );
        }

        mapping.setStatus(SubscriptionStatus.REJECTED);
        WholesalerSellerMapping saved = mappingRepository.save(mapping);

        return convertToDTO(saved, messageService.get(MessageKeys.SUBSCRIPTION_REJECTED));
    }

    @Override
    public SubscriptionDTO acceptSubscription(Long subscriptionId) {
        log.info("Accepting subscription request id: {}", subscriptionId);

        WholesalerSellerMapping mapping = mappingRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));

        if (mapping.getStatus() != SubscriptionStatus.PENDING) {
            throw new IllegalArgumentException("Only pending subscriptions can be approved");
        }

        mapping.setStatus(SubscriptionStatus.APPROVED);
        WholesalerSellerMapping saved = mappingRepository.save(mapping);
        return convertToDTO(saved, messageService.get(MessageKeys.SUBSCRIPTION_APPROVED));
    }

    @Override
    public SubscriptionDTO rejectSubscriptionById(Long subscriptionId) {
        log.info("Rejecting subscription request id: {}", subscriptionId);

        WholesalerSellerMapping mapping = mappingRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));

        if (mapping.getStatus() != SubscriptionStatus.PENDING) {
            throw new IllegalArgumentException("Only pending subscriptions can be rejected");
        }

        mapping.setStatus(SubscriptionStatus.REJECTED);
        WholesalerSellerMapping saved = mappingRepository.save(mapping);
        return convertToDTO(saved, messageService.get(MessageKeys.SUBSCRIPTION_REJECTED));
    }

    // Get active local sellers
    @Override
    public Page<SubscriptionDTO> getActiveSubscriptions(Long wholesalerId, Pageable pageable) {
        log.info("Fetching active subscriptions for wholesaler: {}", wholesalerId);

        if (!wholesalerRepository.existsById(wholesalerId)) {
            throw new ResourceNotFoundException("Wholesaler not found with ID: " + wholesalerId);
        }

        Specification<WholesalerSellerMapping> spec =
                Specification.where(WholesalerSellerSpecification.byWholesalerId(wholesalerId))
                        .and(WholesalerSellerSpecification.byStatus(SubscriptionStatus.APPROVED));

        Page<WholesalerSellerMapping> page = mappingRepository.findAll(spec, pageable);

        return page.map(this::convertToDTO);
    }

    // ==================== LOCAL SELLER SIDE ====================

    /* Fetching Pending Subscription */
    @Override
    public Page<SubscriptionDTO> getSellerPendingSubscriptions(Long localSellerId, Pageable pageable) {
        log.info("Fetching pending subscriptions for seller: {}", localSellerId);

        if (!localSellerRepository.existsById(localSellerId)) {
            throw new ResourceNotFoundException("Local seller not found with ID: " + localSellerId);
        }

        Specification<WholesalerSellerMapping> spec =
                Specification.where(WholesalerSellerSpecification.byLocalSellerId(localSellerId))
                        .and(WholesalerSellerSpecification.byStatus(SubscriptionStatus.PENDING));

        Page<WholesalerSellerMapping> page = mappingRepository.findAll(spec, pageable);

        return page.map(this::convertToDTO);
    }

    /* Check Subscription Status */
    @Override
    public SubscriptionDTO getSubscriptionStatus(Long localSellerId, Long wholesalerId) {
        log.info("Checking subscription status for seller: {}, wholesaler: {}", localSellerId, wholesalerId);

        Specification<WholesalerSellerMapping> spec =
                Specification.where(WholesalerSellerSpecification.byLocalSellerId(localSellerId))
                        .and(WholesalerSellerSpecification.byWholesalerId(wholesalerId));

        WholesalerSellerMapping mapping = mappingRepository.findOne(spec).orElse(null);

        if (mapping == null) {
            return SubscriptionDTO.builder()
                    .localSellerId(localSellerId)
                    .wholesalerId(wholesalerId)
                    .status(null)
                    .message("No subscription found")
                    .build();
        }

        String message = getStatusMessage(mapping.getStatus());
        return convertToDTO(mapping, message);
    }

    /* cancel subscription  */
    @Override
    public void cancelSubscription(Long localSellerId, Long wholesalerId) {
        log.info("Cancelling subscription for seller: {}, wholesaler: {}", localSellerId, wholesalerId);

        Specification<WholesalerSellerMapping> spec =
                Specification.where(WholesalerSellerSpecification.byLocalSellerId(localSellerId))
                        .and(WholesalerSellerSpecification.byWholesalerId(wholesalerId))
                        .and(WholesalerSellerSpecification.byStatus(SubscriptionStatus.PENDING));

        WholesalerSellerMapping mapping = mappingRepository.findOne(spec)
                .orElseThrow(() -> new ResourceNotFoundException("No pending subscription found"));

        mappingRepository.delete(mapping);
    }

    @Override
    public boolean isSubscribed(Long localSellerId, Long wholesalerId) {
        Specification<WholesalerSellerMapping> spec =
                Specification.where(WholesalerSellerSpecification.byLocalSellerId(localSellerId))
                        .and(WholesalerSellerSpecification.byWholesalerId(wholesalerId))
                        .and(WholesalerSellerSpecification.byStatus(SubscriptionStatus.APPROVED));

        return mappingRepository.exists(spec);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private WholesalerSellerMapping findMapping(Long wholesalerId, Long localSellerId) {
        Specification<WholesalerSellerMapping> spec =
                Specification.where(WholesalerSellerSpecification.byWholesalerId(wholesalerId))
                        .and(WholesalerSellerSpecification.byLocalSellerId(localSellerId));

        return mappingRepository.findOne(spec)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
    }

    private String getStatusMessage(SubscriptionStatus status) {
        switch (status) {
            case APPROVED: return "Active subscription";
            case PENDING: return "Pending approval";
            case REJECTED: return "Rejected";
            case INACTIVE: return "Inactive";
            default: return status.toString();
        }
    }

    private SubscriptionDTO convertToDTO(WholesalerSellerMapping mapping) {
        return convertToDTO(mapping,null);
    }

    // Mapping entity → DTO
    private SubscriptionDTO convertToDTO(WholesalerSellerMapping mapping, String message) {
        SubscriptionDTO dto = modelMapper.map(mapping, SubscriptionDTO.class);
        dto.setLocalSellerId(mapping.getLocalSeller().getId());
        dto.setLocalSellerName(mapping.getLocalSeller().getUser().getUsername());
        dto.setLocalSellerShop(mapping.getLocalSeller().getShopName());
        dto.setWholesalerId(mapping.getWholesaler().getId());
        dto.setWholesalerName(mapping.getWholesaler().getBusinessName());
        dto.setMessage(message);
        return dto;
    }
}
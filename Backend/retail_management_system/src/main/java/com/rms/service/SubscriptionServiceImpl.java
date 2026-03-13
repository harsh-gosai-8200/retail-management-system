package com.rms.service;

import com.rms.constants.MessageKeys;
import com.rms.dto.SubscriptionDTO;
import com.rms.model.SubscriptionStatus;
import com.rms.model.WholesalerSellerMapping;
import com.rms.repository.WholesalerSellerMappingRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final WholesalerSellerMappingRepository mappingRepository;
    private final ModelMapper modelMapper;
    private final MessageService messageService;

    // Get all pending requests for a wholesaler
    @Override
    public List<SubscriptionDTO> getPendingRequests(Long wholesalerId) {
        return mappingRepository
                .findByWholesaler_IdAndStatus(wholesalerId, SubscriptionStatus.PENDING)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Approve subscription
    @Override
    public void approveSubscription(Long wholesalerId, Long localSellerId) {
        WholesalerSellerMapping mapping =
                mappingRepository.findByLocalSeller_IdAndWholesaler_Id(localSellerId, wholesalerId);

        if (mapping == null) throw new RuntimeException(messageService.get(MessageKeys.SUBSCRIPTION_NOT_FOUND));

        mapping.setStatus(SubscriptionStatus.APPROVED);
        mappingRepository.save(mapping);
    }

    // Reject subscription
    @Override
    public void rejectSubscription(Long wholesalerId, Long localSellerId) {
        WholesalerSellerMapping mapping =
                mappingRepository.findByLocalSeller_IdAndWholesaler_Id(localSellerId, wholesalerId);

        if (mapping == null) throw new RuntimeException(messageService.get(MessageKeys.SUBSCRIPTION_REJECTED));

        mapping.setStatus(SubscriptionStatus.REJECTED);
        mappingRepository.save(mapping);
    }

    // Get active local sellers
    @Override
    public List<SubscriptionDTO> getActiveLocalSellers(Long wholesalerId) {
        return mappingRepository
                .findByWholesaler_IdAndStatus(wholesalerId, SubscriptionStatus.APPROVED)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Mapping entity → DTO
    private SubscriptionDTO mapToDTO(WholesalerSellerMapping mapping) {
        SubscriptionDTO dto = new SubscriptionDTO();

        if (mapping !=null) {
            dto.setId(mapping.getId());
            if (mapping.getLocalSeller() != null) {
                dto.setLocalSellerId(mapping.getLocalSeller().getId());
                dto.setLocalSellerName(mapping.getLocalSeller().getUser().getUsername());
            }
            if (mapping.getWholesaler() != null) {
                dto.setWholesalerId(mapping.getWholesaler().getId());
                dto.setWholesalerName(mapping.getWholesaler().getUser().getUsername());
            }
            dto.setStatus(mapping.getStatus());
        }
        return dto;
    }
}
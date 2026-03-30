package com.rms.service;

import com.rms.constants.MessageKeys;
import com.rms.dto.UpdateWholesalerDTO;
import com.rms.dto.WholesalerDTO;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.User;
import com.rms.model.Wholesaler;
import com.rms.repository.WholesalerRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class WholesalerServiceImpl implements WholesalerService{
    private final WholesalerRepository wholesalerRepository;
    private final MessageService messageService;

    @Override
    public WholesalerDTO getProfile(Long userId) {
        return wholesalerRepository.findByUserId(userId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageService.get(MessageKeys.WHOLESALER_NOT_FOUND)
                ));
    }

    public WholesalerDTO updateProfile(Long userId, UpdateWholesalerDTO dto) {
        Wholesaler wholesaler = wholesalerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.get(MessageKeys.WHOLESALER_NOT_FOUND)));

        User user = wholesaler.getUser();

        // Update User fields
        if (dto.getUsername() != null) user.setUsername(dto.getUsername());
        if (dto.getPhone()!= null) user.setPhone(dto.getPhone());

        // Update Seller fields
        if (dto.getBusinessName() !=null) wholesaler.setBusinessName(dto.getBusinessName());
        if (dto.getGstNumber()!=null) wholesaler.setGstNumber(dto.getGstNumber());
        if (dto.getAddress() != null) wholesaler.setAddress(dto.getAddress());

        // Save
        wholesalerRepository.save(wholesaler);

        return mapToDTO(wholesaler);
    }

    private WholesalerDTO mapToDTO(Wholesaler wholesaler) {
        return WholesalerDTO.builder()

                // userField
                .id(wholesaler.getId())
                .email(wholesaler.getUser().getEmail())
                .phone(wholesaler.getUser().getPhone())
                .username(wholesaler.getUser().getUsername())

                // wholesaler
                .businessName(wholesaler.getBusinessName())
                .address(wholesaler.getAddress())
                .gstNumber(wholesaler.getGstNumber())

                .isActive(wholesaler.getUser().getIsActive())
                .build();
    }
}

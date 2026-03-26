package com.rms.service;

import com.rms.constants.MessageKeys;
import com.rms.dto.UpdateWholesalerDTO;
import com.rms.dto.WholesalerDTO;
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
        Wholesaler wholesaler = wholesalerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(messageService.get(MessageKeys.WHOLESALER_NOT_FOUND)));
        return mapToDTO(wholesaler);
    }

    @Override
    public WholesalerDTO updateProfile(Long userId, UpdateWholesalerDTO dto) {
        Wholesaler seller = wholesalerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(messageService.get(MessageKeys.WHOLESALER_NOT_FOUND)));

        User user = seller.getUser();

        // Update User fields
        if (dto.getUsername() != null) user.setUsername(dto.getUsername());
        if (dto.getPhone()!= null) user.setPhone(dto.getPhone());

        // Update Seller fields
        if (dto.getBusinessName() !=null) seller.setBusinessName(dto.getBusinessName());
        if (dto.getGstNumber()!=null) seller.setGstNumber(dto.getGstNumber());
        if (dto.getAddress() != null) seller.setAddress(dto.getAddress());

        // Save
        wholesalerRepository.save(seller);

        return mapToDTO(seller);
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

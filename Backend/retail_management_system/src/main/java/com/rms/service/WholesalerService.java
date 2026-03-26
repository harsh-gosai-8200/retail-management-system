package com.rms.service;

import com.rms.dto.UpdateWholesalerDTO;
import com.rms.dto.WholesalerDTO;

public interface WholesalerService {
    WholesalerDTO getProfile(Long userId);
    WholesalerDTO updateProfile(Long userId, UpdateWholesalerDTO updateDTO);
}

package com.rms.controller;

import com.rms.constants.MessageKeys;
import com.rms.dto.UpdateWholesalerDTO;
import com.rms.dto.WholesalerDTO;
import com.rms.model.User;
import com.rms.repository.UserRepository;
import com.rms.service.MessageService;
import com.rms.service.WholesalerService;
import com.rms.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wholesaler")
@RequiredArgsConstructor
public class WholesalerController {

    private final WholesalerService wholesalerService;
    private final UserRepository userRepository;
    private final MessageService messageService;

    @GetMapping("/profile")
    public WholesalerDTO getProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return wholesalerService.getProfile(user.getId());
    }

    @PutMapping("/profile")
    public WholesalerDTO updateProfile(Authentication authentication,
                                       @RequestBody UpdateWholesalerDTO updateDTO) {
        User user = getAuthenticatedUser(authentication);
        return wholesalerService.updateProfile(user.getId(), updateDTO);
    }

    /**
     * Helper method to fetch authenticated User
     */
    private User getAuthenticatedUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(messageService.get(MessageKeys.WHOLESALER_NOT_FOUND)));
    }
}
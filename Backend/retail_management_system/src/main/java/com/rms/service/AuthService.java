package com.rms.service;

import com.rms.dto.LoginRequestDTO;
import com.rms.dto.LoginResponceDTO;
import com.rms.dto.RegisterRequestDTO;
import com.rms.model.LocalSeller;
import com.rms.model.Role;
import com.rms.model.User;
import com.rms.model.Wholesaler;
import com.rms.repository.LocalSellerRepository;
import com.rms.repository.UserRepository;
import com.rms.repository.WholesalerRepository;
import com.rms.utils.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final WholesalerRepository wholesalerRepository;
    private final LocalSellerRepository localSellerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Transactional
    public String register(RegisterRequestDTO registerRequestDTO){

        if(userRepository.existsByEmail(registerRequestDTO.getEmail())){
            throw new RuntimeException("Email already registered");
        }

        if(registerRequestDTO.getRole() == null){
            throw new RuntimeException("Role is required");
        }

        User user = new User();
        user.setUsername(registerRequestDTO.getName());
        user.setEmail(registerRequestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        user.setPhone(registerRequestDTO.getPhone());
        user.setRole(registerRequestDTO.getRole());
        user.setIsActive(true);

        userRepository.save(user);

        if(registerRequestDTO.getRole() == Role.WHOLESALER){

            Wholesaler wholesaler = new Wholesaler();
            wholesaler.setUser(user);
            wholesaler.setBusinessName(registerRequestDTO.getBusinessName());
            wholesaler.setAddress(registerRequestDTO.getAddress());
            wholesaler.setGstNumber(registerRequestDTO.getGstNumber());

            wholesalerRepository.save(wholesaler);
        } else if (registerRequestDTO.getRole()==Role.LOCAL_SELLER) {

            LocalSeller localSeller = new LocalSeller();
            localSeller.setUser(user);
            localSeller.setShopName(registerRequestDTO.getShopName());
            localSeller.setAddress(registerRequestDTO.getAddress());
            localSeller.setLatitude(registerRequestDTO.getLatitude());
            localSeller.setLongitude(registerRequestDTO.getLongitude());

            localSellerRepository.save(localSeller);
        }

        return "Registration successful";
    }


    @Transactional
    public LoginResponceDTO login(LoginRequestDTO requestDTO){

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        requestDTO.getEmail(),
                        requestDTO.getPassword()
                )
        );

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        String token = jwtUtil.generateToken(
                requestDTO.getEmail(),
                role
        );

        return new LoginResponceDTO(token, role);
    }
}

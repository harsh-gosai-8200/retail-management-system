package com.rms.service;

import com.rms.dto.LoginRequestDTO;
import com.rms.dto.LoginResponceDTO;
import com.rms.dto.RegisterRequestDTO;
import com.rms.model.*;
import com.rms.repository.*;
import com.rms.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final WholesalerRepository wholesalerRepository;
    private final LocalSellerRepository localSellerRepository;
    private final SalesmanRepository salesmanRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Transactional
    public String register(RegisterRequestDTO request) {

        // 1. Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // 2. Create user - using username from request
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // 3. Create role-specific details
        if (request.getRole() == Role.WHOLESALER) {
            Wholesaler wholesaler = new Wholesaler();
            wholesaler.setUser(savedUser);
            wholesaler.setBusinessName(request.getBusinessName());
            wholesaler.setAddress(request.getAddress());
            wholesaler.setGstNumber(request.getGstNumber());
            wholesalerRepository.save(wholesaler);

        } else if (request.getRole() == Role.LOCAL_SELLER) {
            LocalSeller seller = new LocalSeller();
            seller.setUser(savedUser);
            seller.setShopName(request.getShopName());
            seller.setAddress(request.getAddress());
            seller.setLatitude(request.getLatitude());
            seller.setLongitude(request.getLongitude());
            localSellerRepository.save(seller);

        } else if (request.getRole() == Role.SALESMAN) {
            // Validate wholesaler exists
            Wholesaler wholesaler = wholesalerRepository.findById(request.getWholesalerId())
                    .orElseThrow(() -> new RuntimeException("Wholesaler not found with id: " + request.getWholesalerId()));

            Salesman salesman = new Salesman();
            salesman.setUser(savedUser);
            salesman.setWholesaler(wholesaler);
            salesman.setRegion(request.getRegion());
            salesmanRepository.save(salesman);
        }

        return "Registration successful for " + request.getUsername();
    }

    public LoginResponceDTO login(LoginRequestDTO request) {

        // 1. Authenticate
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. Get user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        // 3. Generate token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        Long roleId = null;
        String businessName = null;
        String shopName = null;

        if (user.getRole() == Role.WHOLESALER) {
            Wholesaler wholesaler = wholesalerRepository.findByUserId(user.getId())
                    .orElse(null);
            if (wholesaler != null) {
                roleId = wholesaler.getId();           // ✅ This is what you need for products
                businessName = wholesaler.getBusinessName();
            }
        } else if (user.getRole() == Role.LOCAL_SELLER) {
            LocalSeller seller = localSellerRepository.findByUserId(user.getId())
                    .orElse(null);
            if (seller != null) {
                roleId = seller.getId();               // ✅ This is what you need for orders/cart
                shopName = seller.getShopName();
            }
        }

        // 4. Return response with username
        return LoginResponceDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .roleId(roleId)                          // ✅ Send this to frontend
                .role(user.getRole().name())
                .email(user.getEmail())
                .username(user.getUsername())
                .businessName(businessName)
                .shopName(shopName)
                .build();
    }
}
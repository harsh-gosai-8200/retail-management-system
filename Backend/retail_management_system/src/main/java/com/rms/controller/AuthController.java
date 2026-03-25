package com.rms.controller;

import com.rms.dto.*;
import com.rms.service.AuthService;
import com.rms.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;
    private final String MESSAGE = "message";
    private final String ERROR = "message";

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        try {
            String message = authService.register(request);
            return ResponseEntity.ok(Map.of(MESSAGE, message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            LoginResponceDTO response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(ERROR, e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        otpService.generateAndSendOtp(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your email",
                "email", request.getEmail()
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody VerifyOtpRequestDTO request) {
        otpService.verifyOtpAndResetPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword()
        );
        return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully. Please login with new password."
        ));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        otpService.generateAndSendOtp(request.getEmail());
        return ResponseEntity.ok(Map.of(
                "message", "New OTP sent to your email",
                "email", request.getEmail()
        ));
    }
}
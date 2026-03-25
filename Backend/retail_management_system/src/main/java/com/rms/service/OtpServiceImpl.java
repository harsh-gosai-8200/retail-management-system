package com.rms.service;

import com.rms.model.PasswordResetOtp;
import com.rms.repository.PasswordResetOtpRepository;
import com.rms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpServiceImpl implements OtpService {

    private final PasswordResetOtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final int OTP_EXPIRY_MINUTES = 10;

    /**
     * this function is generate and send otp for password reset
     * @param email
     */
    @Override
    @Transactional
    public void generateAndSendOtp(String email) {
        log.info("Generating OTP for email: {}", email);

        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("User not found with email: " + email);
        }

        String otp = generateOtp();

        otpRepository.deleteExpiredOtps(LocalDateTime.now());

        PasswordResetOtp otpEntity = new PasswordResetOtp();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));

        otpRepository.save(otpEntity);

        emailService.sendOtpEmail(email, otp);

        log.info("OTP generated and sent to: {}", email);
    }

    /**
     * this function verifies otp which user enter for reset password
     * @param email
     * @param otp
     * @param newPassword
     */
    @Override
    @Transactional
    public void verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        log.info("Verifying OTP for email: {}", email);

        PasswordResetOtp otpEntity = otpRepository
                .findByEmailAndOtpAndUsedFalse(email, otp)
                .orElseThrow(() -> new RuntimeException("Invalid or expired OTP"));

        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        otpRepository.markAsUsed(email, otp);

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        emailService.sendPasswordResetConfirmation(email);

        log.info("Password reset successful for: {}", email);
    }

    /**
     * helper method for generate 6-digit OTP
     * @return
     */
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
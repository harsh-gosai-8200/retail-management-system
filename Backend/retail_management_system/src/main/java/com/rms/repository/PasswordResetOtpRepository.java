package com.rms.repository;

import com.rms.model.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findByEmailAndOtpAndUsedFalse(String email, String otp);

    @Modifying
    @Query("UPDATE PasswordResetOtp o SET o.used = true WHERE o.email = :email AND o.otp = :otp")
    void markAsUsed(@Param("email") String email, @Param("otp") String otp);

    @Modifying
    @Query("DELETE FROM PasswordResetOtp o WHERE o.expiresAt < :now")
    void deleteExpiredOtps(@Param("now") LocalDateTime now);
}

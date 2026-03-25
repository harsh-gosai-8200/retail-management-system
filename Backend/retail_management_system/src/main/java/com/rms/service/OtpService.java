package com.rms.service;

public interface OtpService {

    void generateAndSendOtp(String email);

    void verifyOtpAndResetPassword(String email, String otp, String newPassword);

}

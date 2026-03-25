package com.rms.service;

public interface EmailService {

    void sendOtpEmail(String to, String otp);

    void sendPasswordResetConfirmation(String to);

    void sendInvoiceEmail(String to, String orderNumber, byte[] pdfBytes, String pdfFileName);
}

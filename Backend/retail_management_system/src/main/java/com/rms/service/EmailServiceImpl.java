package com.rms.service;


import com.rms.configuration.MailProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;

    /**
     * send email of otp for reset password
     * @param to
     * @param otp
     */
    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailProperties.getUsername());
            message.setTo(to);
            message.setSubject("Password Reset OTP - Retail Management System");
            message.setText(String.format(
                    """
                    Hello,
                    
                    You requested to reset your password for Retail Management System.
                    
                    Your OTP for password reset is: %s
                    
                    This OTP is valid for 10 minutes.
                    
                    If you didn't request this, please ignore this email.
                    
                    Regards,
                    Retail Management Team
                    """, otp));

            mailSender.send(message);
            log.info("OTP email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }
    }

    /**
     * password successfully change confirmation email
     * @param to
     */
    public void sendPasswordResetConfirmation(String to) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailProperties.getUsername());
            message.setTo(to);
            message.setSubject("Password Reset Successful - Retail Management System");
            message.setText("""
                Hello,
                
                Your password has been successfully reset.
                
                If you didn't perform this action, please contact support immediately.
                
                Regards,
                Retail Management Team
                """);

            mailSender.send(message);
            log.info("Password reset confirmation email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send confirmation email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * send invoice to local seller email
     * @param to
     * @param orderNumber
     * @param pdfBytes
     * @param pdfFileName
     */
    public void sendInvoiceEmail(String to, String orderNumber, byte[] pdfBytes, String pdfFileName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailProperties.getUsername());
            helper.setTo(to);
            helper.setSubject("Invoice for Order #" + orderNumber);

            String body = String.format("""
                <html>
                <body style="font-family: Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Invoice for Order #%s</h2>
                        
                        <p>Dear Customer,</p>
                        
                        <p>Thank you for your order! Your order has been delivered successfully.</p>
                        
                        <p>Please find your invoice attached to this email.</p>
                        
                        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0;">Order Summary</h3>
                            <p style="margin: 5px 0;"><strong>Order Number:</strong> %s</p>
                            <p style="margin: 5px 0;"><strong>Order Date:</strong> %s</p>
                        </div>
                        
                        <p>If you have any questions, please contact our support team.</p>
                        
                        <p>Thank you for choosing Retail Management System!</p>
                        
                        <hr style="margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 12px;">
                            This is an automated email. Please do not reply.
                        </p>
                    </div>
                </body>
                </html>
                """,
                    orderNumber, orderNumber,
                    java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm"))
            );

            helper.setText(body, true);
            helper.addAttachment(pdfFileName, new ByteArrayResource(pdfBytes));

            mailSender.send(message);
            log.info("Invoice email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send invoice email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send invoice email", e);
        }
    }
}
package com.rms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class InvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private Long orderId;
    private String orderNumber;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String status;
    private String pdfUrl;
    private LocalDateTime generatedAt;
    private LocalDateTime paidAt;
}

package com.rms.service;

import com.rms.dto.InvoiceDTO;
import com.rms.dto.InvoiceStatsDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface InvoiceService {

    InvoiceDTO generateAndSendInvoice(Long orderId);

    byte[] downloadInvoicePdf(Long orderId);

    void resendInvoiceEmail(Long orderId);

    InvoiceDTO getInvoiceByOrderId(Long orderId);

    Page<InvoiceDTO> getSellerInvoices(
            Long sellerId,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount,
            Pageable pageable);

    InvoiceStatsDTO getInvoiceStats(Long sellerId);

    Page<InvoiceDTO> getWholesalerInvoices(
            Long wholesalerId,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount,
            Pageable pageable);

    InvoiceStatsDTO getWholesalerInvoiceStats(Long wholesalerId);

}

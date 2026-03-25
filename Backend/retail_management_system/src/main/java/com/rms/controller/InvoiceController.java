package com.rms.controller;

import com.rms.dto.InvoiceDTO;
import com.rms.dto.InvoiceStatsDTO;
import com.rms.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping("/seller")
    @PreAuthorize("hasRole('LOCAL_SELLER')")
    public ResponseEntity<Page<InvoiceDTO>> getSellerInvoices(
            @RequestParam Long sellerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @PageableDefault(size = 10, sort = "generatedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        return ResponseEntity.ok(invoiceService.getSellerInvoices(
                sellerId, status, search, startDate, endDate, minAmount, maxAmount, pageable));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('LOCAL_SELLER')")
    public ResponseEntity<InvoiceStatsDTO> getInvoiceStats(@RequestParam Long sellerId) {
        return ResponseEntity.ok(invoiceService.getInvoiceStats(sellerId));
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('WHOLESALER', 'LOCAL_SELLER')")
    public ResponseEntity<InvoiceDTO> getInvoiceByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByOrderId(orderId));
    }

    @GetMapping("/download/{orderId}")
    @PreAuthorize("hasAnyRole('WHOLESALER', 'LOCAL_SELLER')")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long orderId) {
        byte[] pdfBytes = invoiceService.downloadInvoicePdf(orderId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice_" + orderId + ".pdf")
                .body(pdfBytes);
    }

    @PostMapping("/resend/{orderId}")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<?> resendInvoice(@PathVariable Long orderId) {
        invoiceService.resendInvoiceEmail(orderId);
        return ResponseEntity.ok(Map.of("message", "Invoice email resent successfully"));
    }

    @GetMapping("/wholesaler")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<Page<InvoiceDTO>> getWholesalerInvoices(
            @RequestParam Long wholesalerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @PageableDefault(size = 10, sort = "generatedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {

        return ResponseEntity.ok(invoiceService.getWholesalerInvoices(
                wholesalerId, status, search, startDate, endDate, minAmount, maxAmount, pageable));
    }

    @GetMapping("/wholesaler/stats")
    @PreAuthorize("hasRole('WHOLESALER')")
    public ResponseEntity<InvoiceStatsDTO> getWholesalerInvoiceStats(@RequestParam Long wholesalerId) {
        return ResponseEntity.ok(invoiceService.getWholesalerInvoiceStats(wholesalerId));
    }
}
package com.rms.service;

import com.rms.dto.InvoiceDTO;
import com.rms.dto.InvoiceStatsDTO;
import com.rms.exception.ResourceNotFoundException;
import com.rms.model.Invoice;
import com.rms.model.Order;
import com.rms.model.enums.OrderStatus;
import com.rms.repository.InvoiceRepository;
import com.rms.repository.OrderRepository;
import com.rms.specification.InvoiceSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final PdfService pdfService;
    private final EmailService emailService;

    private static final String INVOICE_PREFIX = "INV";

    /**
     * this function generate the invoice when salesman mark order as deliver and directly send invoice to user email
     * @param orderId
     * @return
     */
    @Transactional
    public InvoiceDTO generateAndSendInvoice(Long orderId) {
        log.info("Generating invoice for order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Invoice can only be generated for delivered orders");
        }

        if (invoiceRepository.findByOrderId(orderId).isPresent()) {
            log.info("Invoice already exists for order: {}", orderId);
            return getInvoiceByOrderId(orderId);
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setOrder(order);
        invoice.setSubtotal(order.getSubtotal());
        invoice.setTaxAmount(order.getTaxAmount());
        invoice.setTotalAmount(order.getTotalAmount());
        if ("PAID".equals(order.getPaymentStatus())) {
            invoice.setStatus("PAID");
            invoice.setPaidAt(order.getUpdatedAt());
            log.info("Invoice marked as PAID for online payment order: {}", orderId);
        } else {
            invoice.setStatus("GENERATED");
            log.info("Invoice marked as GENERATED for COD order: {}", orderId);
        }
        invoice.setGeneratedAt(LocalDateTime.now());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        byte[] pdfBytes = pdfService.generateInvoicePdf(savedInvoice, order);
        String pdfUrl = "/invoices/" + savedInvoice.getInvoiceNumber() + ".pdf";
        savedInvoice.setPdfUrl(pdfUrl);
        invoiceRepository.save(savedInvoice);

        String sellerEmail = order.getSeller().getUser().getEmail();
        String pdfFileName = savedInvoice.getInvoiceNumber() + ".pdf";
        emailService.sendInvoiceEmail(sellerEmail, order.getOrderNumber(), pdfBytes, pdfFileName);

        log.info("Invoice generated and PDF sent to seller: {}", sellerEmail);

        return mapToDTO(savedInvoice);
    }

    /**
     * this function give functionality to user to get add invoice and filtering them
     * @param sellerId
     * @param status
     * @param search
     * @param startDate
     * @param endDate
     * @param minAmount
     * @param maxAmount
     * @param pageable
     * @return
     */
    public Page<InvoiceDTO> getSellerInvoices(
            Long sellerId,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount,
            Pageable pageable) {

        log.info("Fetching invoices for seller: {} with filters - status: {}, search: {}, date range: {} to {}",
                sellerId, status, search, startDate, endDate);

        Specification<Invoice> spec = InvoiceSpecification.withFilters(
                sellerId, status, search, startDate, endDate, minAmount, maxAmount);

        Page<Invoice> invoices = invoiceRepository.findAll(spec, pageable);

        return invoices.map(this::mapToDTO);
    }

    /**
     * this if indicating user about invoice status and its statistics
     * @param sellerId
     * @return
     */
    public InvoiceStatsDTO getInvoiceStats(Long sellerId) {
        log.info("Fetching invoice stats for seller: {}", sellerId);

        Specification<Invoice> sellerSpec = InvoiceSpecification.bySellerId(sellerId);

        long total = invoiceRepository.count(sellerSpec);
        long pending = invoiceRepository.count(sellerSpec.and(InvoiceSpecification.byStatus("PENDING")));
        long paid = invoiceRepository.count(sellerSpec.and(InvoiceSpecification.byStatus("PAID")));

        // Calculate total amount (sum of all invoices)
        Double totalAmount = invoiceRepository.findAll(sellerSpec).stream()
                .mapToDouble(i -> i.getTotalAmount().doubleValue())
                .sum();

        return InvoiceStatsDTO.builder()
                .total(total)
                .pending(pending)
                .paid(paid)
                .totalAmount(totalAmount)
                .build();
    }

    /**
     * give functionality to download invoice from portal
     * @param orderId
     * @return
     */
    public byte[] downloadInvoicePdf(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        return pdfService.generateInvoicePdf(invoice, order);
    }

    /**
     * get all invoices for wholesaler
     * @param wholesalerId
     * @param status
     * @param search
     * @param startDate
     * @param endDate
     * @param minAmount
     * @param maxAmount
     * @param pageable
     * @return
     */
    @Override
    public Page<InvoiceDTO> getWholesalerInvoices(
            Long wholesalerId,
            String status,
            String search,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount,
            Pageable pageable) {

        log.info("Fetching invoices for wholesaler: {} with filters - status: {}, search: {}, date range: {} to {}",
                wholesalerId, status, search, startDate, endDate);

        Specification<Invoice> spec = InvoiceSpecification.withWholesalerFilters(
                wholesalerId, status, search, startDate, endDate, minAmount, maxAmount);

        Page<Invoice> invoices = invoiceRepository.findAll(spec, pageable);

        return invoices.map(this::mapToDTO);
    }

    /**
     * get invoice statistics for wholesaler
     * @param wholesalerId
     * @return
     */
    @Override
    public InvoiceStatsDTO getWholesalerInvoiceStats(Long wholesalerId) {
        log.info("Fetching invoice stats for wholesaler: {}", wholesalerId);

        Specification<Invoice> wholesalerSpec = InvoiceSpecification.byWholesalerId(wholesalerId);

        long total = invoiceRepository.count(wholesalerSpec);
        long pending = invoiceRepository.count(wholesalerSpec.and(InvoiceSpecification.byStatus("PENDING")));
        long paid = invoiceRepository.count(wholesalerSpec.and(InvoiceSpecification.byStatus("PAID")));
        long overdue = invoiceRepository.count(wholesalerSpec.and(InvoiceSpecification.byStatus("OVERDUE")));

        // Calculate total amount (sum of all invoices)
        Double totalAmount = invoiceRepository.findAll(wholesalerSpec).stream()
                .mapToDouble(i -> i.getTotalAmount().doubleValue())
                .sum();

        return InvoiceStatsDTO.builder()
                .total(total)
                .pending(pending)
                .paid(paid)
                .overdue(overdue)
                .totalAmount(totalAmount)
                .build();
    }

    /**
     * give functionality to resend the invoice in email
     * @param orderId
     */
    public void resendInvoiceEmail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        byte[] pdfBytes = pdfService.generateInvoicePdf(invoice, order);
        String sellerEmail = order.getSeller().getUser().getEmail();
        String pdfFileName = invoice.getInvoiceNumber() + ".pdf";

        emailService.sendInvoiceEmail(sellerEmail, order.getOrderNumber(), pdfBytes, pdfFileName);
        log.info("Invoice email resent to: {}", sellerEmail);
    }

    /**
     * helper method for get invoice from order id
     * @param orderId
     * @return
     */
    public InvoiceDTO getInvoiceByOrderId(Long orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        return mapToDTO(invoice);
    }

    /**
     * helper method to generate invoice number
     * @return
     */
    private String generateInvoiceNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = invoiceRepository.count() + 1;
        String sequencePart = String.format("%05d", count);
        return INVOICE_PREFIX + "-" + datePart + "-" + sequencePart;
    }

    private InvoiceDTO mapToDTO(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .orderId(invoice.getOrder().getId())
                .orderNumber(invoice.getOrder().getOrderNumber())
                .subtotal(invoice.getSubtotal())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .pdfUrl(invoice.getPdfUrl())
                .generatedAt(invoice.getGeneratedAt())
                .paidAt(invoice.getPaidAt())
                .build();
    }
}
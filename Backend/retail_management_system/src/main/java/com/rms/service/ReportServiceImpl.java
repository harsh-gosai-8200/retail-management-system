package com.rms.service;


import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.rms.dto.*;
import com.rms.model.*;
import com.rms.model.enums.OrderStatus;
import com.rms.model.enums.PaymentStatus;
import com.rms.repository.*;
import com.rms.specification.OrderSpecification;
import com.rms.specification.PaymentTransactionSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public SalesReportDTO generateSalesReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating sales report from {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        Specification<PaymentTransaction> paymentSpec = PaymentTransactionSpecification.byStatus(PaymentStatus.SUCCESS)
                .and(PaymentTransactionSpecification.byDateRange(startDateTime, endDateTime));
        List<PaymentTransaction> payments = paymentTransactionRepository.findAll(paymentSpec);

        Specification<Order> orderSpec = OrderSpecification.createdBetween(startDateTime, endDateTime);
        List<Order> orders = orderRepository.findAll(orderSpec);

        // Calculate totals
        BigDecimal totalRevenue = payments.stream()
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCommission = totalRevenue.multiply(BigDecimal.valueOf(0.10));
        BigDecimal netRevenue = totalRevenue.subtract(totalCommission);

        long totalOrders = orders.size();

        Specification<Order> completedSpec = OrderSpecification.createdBetween(startDateTime, endDateTime)
                .and(OrderSpecification.byStatus(OrderStatus.DELIVERED));
        long completedOrders = orderRepository.count(completedSpec);

        Specification<Order> cancelledSpec = OrderSpecification.createdBetween(startDateTime, endDateTime)
                .and(OrderSpecification.byStatus(OrderStatus.CANCELLED));
        long cancelledOrders = orderRepository.count(cancelledSpec);

        // Daily sales breakdown
        Map<LocalDate, List<PaymentTransaction>> paymentsByDate = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getCreatedAt().toLocalDate()));

        List<DailySalesDTO> dailySales = paymentsByDate.entrySet().stream()
                .map(entry -> {
                    Specification<Order> dailyOrderSpec = OrderSpecification.createdBetween(
                            entry.getKey().atStartOfDay(),
                            entry.getKey().atTime(LocalTime.MAX));
                    long dailyOrders = orderRepository.count(dailyOrderSpec);

                    return DailySalesDTO.builder()
                            .date(entry.getKey())
                            .ordersCount(dailyOrders)
                            .revenue(entry.getValue().stream()
                                    .map(PaymentTransaction::getAmount)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add))
                            .build();
                })
                .sorted(Comparator.comparing(DailySalesDTO::getDate))
                .collect(Collectors.toList());

        // Payment method summary
        Map<String, List<PaymentTransaction>> paymentsByMethod = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getPaymentMethod() != null ?
                        p.getPaymentMethod().name() : "UNKNOWN"));

        List<PaymentMethodSummaryDTO> paymentMethodSummary = paymentsByMethod.entrySet().stream()
                .map(entry -> PaymentMethodSummaryDTO.builder()
                        .paymentMethod(entry.getKey())
                        .count((long) entry.getValue().size())
                        .amount(entry.getValue().stream()
                                .map(PaymentTransaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .collect(Collectors.toList());

        // Top products
        Specification<Order> ordersSpec = OrderSpecification.createdBetween(startDateTime, endDateTime);
        List<Order> ordersInRange = orderRepository.findAll(ordersSpec);

        List<OrderItem> allOrderItems = ordersInRange.stream()
                .flatMap(order -> order.getItems().stream())
                .collect(Collectors.toList());

        Map<Long, OrderItemSummaryDTO> productSales = new HashMap<>();
        for (OrderItem item : allOrderItems) {
            productSales.compute(item.getProduct().getId(), (k, v) -> {
                if (v == null) {
                    return new OrderItemSummaryDTO(
                            item.getProduct().getId(),
                            item.getProductName(),
                            item.getQuantity(),
                            item.getTotal());
                } else {
                    v.setQuantity(v.getQuantity() + item.getQuantity());
                    v.setRevenue(v.getRevenue().add(item.getTotal()));
                    return v;
                }
            });
        }

        List<TopProductDTO> topProducts = productSales.values().stream()
                .map(summary -> TopProductDTO.builder()
                        .productId(summary.getProductId())
                        .productName(summary.getProductName())
                        .quantitySold(summary.getQuantity())
                        .revenue(summary.getRevenue())
                        .build())
                .sorted((a, b) -> Long.compare(b.getQuantitySold(), a.getQuantitySold()))
                .limit(10)
                .collect(Collectors.toList());

        // Top sellers
        Specification<Order> paidOrdersSpec = OrderSpecification.createdBetween(startDateTime, endDateTime)
                .and(OrderSpecification.byPaymentStatus("PAID"));
        List<Order> paidOrders = orderRepository.findAll(paidOrdersSpec);

        Map<Long, SellerSummaryDTO> sellerSales = paidOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getSeller().getId(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    long count = list.size();
                                    BigDecimal total = list.stream()
                                            .map(Order::getTotalAmount)
                                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                                    return new SellerSummaryDTO(count, total, list.get(0).getSeller());
                                }
                        )
                ));

        List<TopSellerDTO> topSellers = sellerSales.entrySet().stream()
                .map(entry -> TopSellerDTO.builder()
                        .sellerId(entry.getKey())
                        .sellerName(entry.getValue().getSeller().getUser().getUsername())
                        .shopName(entry.getValue().getSeller().getShopName())
                        .orderCount(entry.getValue().getOrdersCount())
                        .totalSpent(entry.getValue().getTotalSpent())
                        .build())
                .sorted((a, b) -> Long.compare(b.getOrderCount(), a.getOrderCount()))
                .limit(10)
                .collect(Collectors.toList());

        return SalesReportDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(LocalDate.now())
                .totalRevenue(totalRevenue)
                .totalCommission(totalCommission)
                .netRevenue(netRevenue)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .dailySales(dailySales)
                .paymentMethodSummary(paymentMethodSummary)
                .topProducts(topProducts)
                .topSellers(topSellers)
                .build();
    }

    @Override
    public UserReportDTO generateUserReport(LocalDate startDate, LocalDate endDate) {
        log.info("Generating user report from {} to {}", startDate, endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Get all users
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(User::getIsActive).count();
        long inactiveUsers = totalUsers - activeUsers;

        // New users in date range
        List<User> newUsersList = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null &&
                        u.getCreatedAt().toLocalDateTime().isAfter(startDateTime) &&
                        u.getCreatedAt().toLocalDateTime().isBefore(endDateTime))
                .collect(Collectors.toList());
        long newUsers = newUsersList.size();

        // Role breakdown
        long wholesalersCount = allUsers.stream().filter(u -> u.getRole().name().equals("WHOLESALER")).count();
        long localSellersCount = allUsers.stream().filter(u -> u.getRole().name().equals("LOCAL_SELLER")).count();
        long salesmenCount = allUsers.stream().filter(u -> u.getRole().name().equals("SALESMAN")).count();
        long adminsCount = allUsers.stream().filter(u -> u.getRole().name().equals("ADMIN")).count();

        // Daily registrations
        Map<LocalDate, List<User>> registrationsByDate = newUsersList.stream()
                .collect(Collectors.groupingBy(u -> u.getCreatedAt().toLocalDateTime().toLocalDate()));

        List<UserRegistrationDTO> newRegistrations = registrationsByDate.entrySet().stream()
                .map(entry -> {
                    long wholesalers = entry.getValue().stream()
                            .filter(u -> u.getRole().name().equals("WHOLESALER")).count();
                    long localSellers = entry.getValue().stream()
                            .filter(u -> u.getRole().name().equals("LOCAL_SELLER")).count();
                    long salesmen = entry.getValue().stream()
                            .filter(u -> u.getRole().name().equals("SALESMAN")).count();
                    return UserRegistrationDTO.builder()
                            .date(entry.getKey())
                            .wholesalers(wholesalers)
                            .localSellers(localSellers)
                            .salesmen(salesmen)
                            .total(entry.getValue().size())
                            .build();
                })
                .sorted(Comparator.comparing(UserRegistrationDTO::getDate))
                .collect(Collectors.toList());

        // Role distribution with percentages
        List<RoleDistributionDTO> roleDistribution = Arrays.asList(
                RoleDistributionDTO.builder()
                        .role("WHOLESALER")
                        .count(wholesalersCount)
                        .percentage(totalUsers > 0 ? (wholesalersCount * 100.0 / totalUsers) : 0)
                        .build(),
                RoleDistributionDTO.builder()
                        .role("LOCAL_SELLER")
                        .count(localSellersCount)
                        .percentage(totalUsers > 0 ? (localSellersCount * 100.0 / totalUsers) : 0)
                        .build(),
                RoleDistributionDTO.builder()
                        .role("SALESMAN")
                        .count(salesmenCount)
                        .percentage(totalUsers > 0 ? (salesmenCount * 100.0 / totalUsers) : 0)
                        .build(),
                RoleDistributionDTO.builder()
                        .role("ADMIN")
                        .count(adminsCount)
                        .percentage(totalUsers > 0 ? (adminsCount * 100.0 / totalUsers) : 0)
                        .build()
        );

        return UserReportDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .generatedAt(LocalDate.now())
                .totalUsers(totalUsers)
                .newUsers(newUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .wholesalersCount(wholesalersCount)
                .localSellersCount(localSellersCount)
                .salesmenCount(salesmenCount)
                .adminsCount(adminsCount)
                .newRegistrations(newRegistrations)
                .roleDistribution(roleDistribution)
                .build();
    }

    @Override
    public byte[] exportSalesReportToExcel(SalesReportDTO report) {
        log.info("Exporting sales report to Excel");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFWorkbook workbook = new XSSFWorkbook();

            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);

            // ============ SUMMARY SHEET ============
            XSSFSheet summarySheet = workbook.createSheet("Summary");
            int rowNum = 0;

            // Title
            Row titleRow = summarySheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Sales Report");
            titleCell.setCellStyle(headerStyle);
            summarySheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));

            // Date Range
            Row dateRangeRow = summarySheet.createRow(rowNum++);
            dateRangeRow.createCell(0).setCellValue("Period:");
            dateRangeRow.createCell(1).setCellValue(report.getStartDate() + " to " + report.getEndDate());

            rowNum++; // empty row

            // Summary Data
            addSummaryRow(summarySheet, rowNum++, "Total Revenue", report.getTotalRevenue(), currencyStyle);
            addSummaryRow(summarySheet, rowNum++, "Platform Commission (10%)", report.getTotalCommission(), currencyStyle);
            addSummaryRow(summarySheet, rowNum++, "Net Revenue", report.getNetRevenue(), currencyStyle);
            addSummaryRow(summarySheet, rowNum++, "Total Orders", (double) report.getTotalOrders(), numberStyle);
            addSummaryRow(summarySheet, rowNum++, "Completed Orders", (double) report.getCompletedOrders(), numberStyle);
            addSummaryRow(summarySheet, rowNum++, "Cancelled Orders", (double) report.getCancelledOrders(), numberStyle);

            // Auto-size columns
            for (int i = 0; i < 4; i++) {
                summarySheet.autoSizeColumn(i);
            }

            // ============ DAILY SALES SHEET ============
            XSSFSheet dailySheet = workbook.createSheet("Daily Sales");
            rowNum = 0;

            // Header
            Row dailyHeader = dailySheet.createRow(rowNum++);
            createCell(dailyHeader, 0, "Date", headerStyle);
            createCell(dailyHeader, 1, "Orders Count", headerStyle);
            createCell(dailyHeader, 2, "Revenue (₹)", headerStyle);

            // Data
            for (DailySalesDTO daily : report.getDailySales()) {
                Row row = dailySheet.createRow(rowNum++);
                createCell(row, 0, daily.getDate().toString(), dateStyle);
                createCell(row, 1, daily.getOrdersCount(), numberStyle);
                createCell(row, 2, daily.getRevenue(), currencyStyle);
            }

            // Auto-size columns
            for (int i = 0; i < 3; i++) {
                dailySheet.autoSizeColumn(i);
            }

            XSSFSheet paymentSheet = workbook.createSheet("Payment Methods");
            rowNum = 0;

            Row paymentHeader = paymentSheet.createRow(rowNum++);
            createCell(paymentHeader, 0, "Payment Method", headerStyle);
            createCell(paymentHeader, 1, "Count", headerStyle);
            createCell(paymentHeader, 2, "Amount (₹)", headerStyle);

            for (PaymentMethodSummaryDTO method : report.getPaymentMethodSummary()) {
                Row row = paymentSheet.createRow(rowNum++);
                createCell(row, 0, method.getPaymentMethod(), null);
                createCell(row, 1, method.getCount(), numberStyle);
                createCell(row, 2, method.getAmount(), currencyStyle);
            }

            for (int i = 0; i < 3; i++) {
                paymentSheet.autoSizeColumn(i);
            }

            XSSFSheet productSheet = workbook.createSheet("Top Products");
            rowNum = 0;

            Row productHeader = productSheet.createRow(rowNum++);
            createCell(productHeader, 0, "Product Name", headerStyle);
            createCell(productHeader, 1, "Quantity Sold", headerStyle);
            createCell(productHeader, 2, "Revenue (₹)", headerStyle);

            for (TopProductDTO product : report.getTopProducts()) {
                Row row = productSheet.createRow(rowNum++);
                createCell(row, 0, product.getProductName(), null);
                createCell(row, 1, product.getQuantitySold(), numberStyle);
                createCell(row, 2, product.getRevenue(), currencyStyle);
            }

            for (int i = 0; i < 3; i++) {
                productSheet.autoSizeColumn(i);
            }

            XSSFSheet sellerSheet = workbook.createSheet("Top Sellers");
            rowNum = 0;

            Row sellerHeader = sellerSheet.createRow(rowNum++);
            createCell(sellerHeader, 0, "Seller Name", headerStyle);
            createCell(sellerHeader, 1, "Shop Name", headerStyle);
            createCell(sellerHeader, 2, "Orders", headerStyle);
            createCell(sellerHeader, 3, "Total Spent (₹)", headerStyle);

            for (TopSellerDTO seller : report.getTopSellers()) {
                Row row = sellerSheet.createRow(rowNum++);
                createCell(row, 0, seller.getSellerName(), null);
                createCell(row, 1, seller.getShopName(), null);
                createCell(row, 2, seller.getOrderCount(), numberStyle);
                createCell(row, 3, seller.getTotalSpent(), currencyStyle);
            }

            for (int i = 0; i < 4; i++) {
                sellerSheet.autoSizeColumn(i);
            }

            workbook.write(out);
            workbook.close();

            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate Excel report: {}", e.getMessage());
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    @Override
    public byte[] exportUserReportToExcel(UserReportDTO report) {
        log.info("Exporting user report to Excel");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFWorkbook workbook = new XSSFWorkbook();

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle numberStyle = createNumberStyle(workbook);
            CellStyle percentStyle = createPercentStyle(workbook);

            XSSFSheet summarySheet = workbook.createSheet("Summary");
            int rowNum = 0;

            // Title
            Row titleRow = summarySheet.createRow(rowNum++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("User Report");
            titleCell.setCellStyle(headerStyle);
            summarySheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 3));

            // Date Range
            Row dateRangeRow = summarySheet.createRow(rowNum++);
            dateRangeRow.createCell(0).setCellValue("Period:");
            dateRangeRow.createCell(1).setCellValue(report.getStartDate() + " to " + report.getEndDate());

            rowNum++;

            // Summary Data
            addSummaryRow(summarySheet, rowNum++, "Total Users", (double) report.getTotalUsers(), numberStyle);
            addSummaryRow(summarySheet, rowNum++, "New Users", (double) report.getNewUsers(), numberStyle);
            addSummaryRow(summarySheet, rowNum++, "Active Users", (double) report.getActiveUsers(), numberStyle);
            addSummaryRow(summarySheet, rowNum++, "Inactive Users", (double) report.getInactiveUsers(), numberStyle);

            rowNum++;

            addSummaryRow(summarySheet, rowNum++, "Wholesalers", (double) report.getWholesalersCount(), numberStyle);
            addSummaryRow(summarySheet, rowNum++, "Local Sellers", (double) report.getLocalSellersCount(), numberStyle);
            addSummaryRow(summarySheet, rowNum++, "Salesmen", (double) report.getSalesmenCount(), numberStyle);
            addSummaryRow(summarySheet, rowNum++, "Admins", (double) report.getAdminsCount(), numberStyle);

            for (int i = 0; i < 4; i++) {
                summarySheet.autoSizeColumn(i);
            }

            XSSFSheet roleSheet = workbook.createSheet("Role Distribution");
            rowNum = 0;

            Row roleHeader = roleSheet.createRow(rowNum++);
            createCell(roleHeader, 0, "Role", headerStyle);
            createCell(roleHeader, 1, "Count", headerStyle);
            createCell(roleHeader, 2, "Percentage", headerStyle);

            for (RoleDistributionDTO role : report.getRoleDistribution()) {
                Row row = roleSheet.createRow(rowNum++);
                createCell(row, 0, role.getRole(), null);
                createCell(row, 1, role.getCount(), numberStyle);
                createCell(row, 2, role.getPercentage(), percentStyle);
            }

            for (int i = 0; i < 3; i++) {
                roleSheet.autoSizeColumn(i);
            }

            XSSFSheet regSheet = workbook.createSheet("New Registrations");
            rowNum = 0;

            Row regHeader = regSheet.createRow(rowNum++);
            createCell(regHeader, 0, "Date", headerStyle);
            createCell(regHeader, 1, "Wholesalers", headerStyle);
            createCell(regHeader, 2, "Local Sellers", headerStyle);
            createCell(regHeader, 3, "Salesmen", headerStyle);
            createCell(regHeader, 4, "Total", headerStyle);

            for (UserRegistrationDTO reg : report.getNewRegistrations()) {
                Row row = regSheet.createRow(rowNum++);
                createCell(row, 0, reg.getDate().toString(), null);
                createCell(row, 1, reg.getWholesalers(), numberStyle);
                createCell(row, 2, reg.getLocalSellers(), numberStyle);
                createCell(row, 3, reg.getSalesmen(), numberStyle);
                createCell(row, 4, reg.getTotal(), numberStyle);
            }

            for (int i = 0; i < 5; i++) {
                regSheet.autoSizeColumn(i);
            }

            workbook.write(out);
            workbook.close();

            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate Excel report: {}", e.getMessage());
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }


    @Override
    public byte[] exportSalesReportToPDF(SalesReportDTO report) {
        log.info("Exporting sales report to PDF");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("Sales Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Date Range
            Paragraph period = new Paragraph("Period: " + report.getStartDate() + " to " + report.getEndDate(), normalFont);
            period.setAlignment(Element.ALIGN_CENTER);
            document.add(period);
            document.add(Chunk.NEWLINE);

            // Summary Section
            Paragraph summaryTitle = new Paragraph("Summary", headerFont);
            document.add(summaryTitle);

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(50);

            addPdfCell(summaryTable, "Total Revenue:", headerFont);
            addPdfCell(summaryTable, String.format("₹%.2f", report.getTotalRevenue()), normalFont);
            addPdfCell(summaryTable, "Platform Commission (10%):", headerFont);
            addPdfCell(summaryTable, String.format("₹%.2f", report.getTotalCommission()), normalFont);
            addPdfCell(summaryTable, "Net Revenue:", headerFont);
            addPdfCell(summaryTable, String.format("₹%.2f", report.getNetRevenue()), normalFont);
            addPdfCell(summaryTable, "Total Orders:", headerFont);
            addPdfCell(summaryTable, String.valueOf(report.getTotalOrders()), normalFont);
            addPdfCell(summaryTable, "Completed Orders:", headerFont);
            addPdfCell(summaryTable, String.valueOf(report.getCompletedOrders()), normalFont);
            addPdfCell(summaryTable, "Cancelled Orders:", headerFont);
            addPdfCell(summaryTable, String.valueOf(report.getCancelledOrders()), normalFont);

            document.add(summaryTable);
            document.add(Chunk.NEWLINE);

            // Top Products Section
            Paragraph productsTitle = new Paragraph("Top Selling Products", headerFont);
            document.add(productsTitle);

            PdfPTable productsTable = new PdfPTable(3);
            productsTable.setWidthPercentage(90);
            productsTable.setWidths(new float[]{50f, 20f, 30f});

            addPdfCell(productsTable, "Product Name", headerFont);
            addPdfCell(productsTable, "Quantity Sold", headerFont);
            addPdfCell(productsTable, "Revenue", headerFont);

            for (TopProductDTO product : report.getTopProducts()) {
                addPdfCell(productsTable, product.getProductName(), normalFont);
                addPdfCell(productsTable, String.valueOf(product.getQuantitySold()), normalFont);
                addPdfCell(productsTable, String.format("₹%.2f", product.getRevenue()), normalFont);
            }

            document.add(productsTable);
            document.add(Chunk.NEWLINE);

            // Footer
            Paragraph footer = new Paragraph("Generated on: " + report.getGeneratedAt(), normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF report: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    @Override
    public byte[] exportUserReportToPDF(UserReportDTO report) {
        log.info("Exporting user report to PDF");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("User Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Date Range
            Paragraph period = new Paragraph("Period: " + report.getStartDate() + " to " + report.getEndDate(), normalFont);
            period.setAlignment(Element.ALIGN_CENTER);
            document.add(period);
            document.add(Chunk.NEWLINE);

            // Summary Section
            Paragraph summaryTitle = new Paragraph("Summary", headerFont);
            document.add(summaryTitle);

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(50);

            addPdfCell(summaryTable, "Total Users:", headerFont);
            addPdfCell(summaryTable, String.valueOf(report.getTotalUsers()), normalFont);
            addPdfCell(summaryTable, "New Users:", headerFont);
            addPdfCell(summaryTable, String.valueOf(report.getNewUsers()), normalFont);
            addPdfCell(summaryTable, "Active Users:", headerFont);
            addPdfCell(summaryTable, String.valueOf(report.getActiveUsers()), normalFont);
            addPdfCell(summaryTable, "Inactive Users:", headerFont);
            addPdfCell(summaryTable, String.valueOf(report.getInactiveUsers()), normalFont);

            document.add(summaryTable);
            document.add(Chunk.NEWLINE);

            // Role Distribution Section
            Paragraph roleTitle = new Paragraph("Role Distribution", headerFont);
            document.add(roleTitle);

            PdfPTable roleTable = new PdfPTable(3);
            roleTable.setWidthPercentage(70);
            roleTable.setWidths(new float[]{40f, 30f, 30f});

            addPdfCell(roleTable, "Role", headerFont);
            addPdfCell(roleTable, "Count", headerFont);
            addPdfCell(roleTable, "Percentage", headerFont);

            for (RoleDistributionDTO role : report.getRoleDistribution()) {
                addPdfCell(roleTable, role.getRole(), normalFont);
                addPdfCell(roleTable, String.valueOf(role.getCount()), normalFont);
                addPdfCell(roleTable, String.format("%.1f%%", role.getPercentage()), normalFont);
            }

            document.add(roleTable);
            document.add(Chunk.NEWLINE);

            // Footer
            Paragraph footer = new Paragraph("Generated on: " + report.getGeneratedAt(), normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF report: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }


    private CellStyle createHeaderStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createNumberStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createCurrencyStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.RIGHT);
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("#,##0.00"));
        return style;
    }

    private CellStyle createDateStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd"));
        return style;
    }

    private CellStyle createPercentStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.RIGHT);
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("0.00%"));
        return style;
    }

    private void createCell(Row row, int column, Object value, CellStyle style) {
        Cell cell = row.createCell(column);
        if (value instanceof String) {
            cell.setCellValue((String) value);
        } else if (value instanceof Double) {
            cell.setCellValue((Double) value);
        } else if (value instanceof Long) {
            cell.setCellValue((Long) value);
        } else if (value instanceof BigDecimal) {
            cell.setCellValue(((BigDecimal) value).doubleValue());
        } else if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        }
        if (style != null) {
            cell.setCellStyle(style);
        }
    }

    private void addSummaryRow(XSSFSheet sheet, int rowNum, String label, double value, CellStyle style) {
        Row row = sheet.createRow(rowNum);
        createCell(row, 0, label, null);
        createCell(row, 1, value, style);
        createCell(row, 2, "", null);
        createCell(row, 3, "", null);
    }

    private void addSummaryRow(XSSFSheet sheet, int rowNum, String label, BigDecimal value, CellStyle style) {
        addSummaryRow(sheet, rowNum, label, value.doubleValue(), style);
    }

    private void addPdfCell(PdfPTable table, String content, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(5);
        table.addCell(cell);
    }
}
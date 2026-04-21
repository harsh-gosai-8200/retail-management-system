package com.rms.controller;

import com.rms.dto.SalesReportDTO;
import com.rms.dto.UserReportDTO;
import com.rms.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    /**
     * getting sales report data
     * @param startDate
     * @param endDate
     * @return
     */
    @GetMapping("/sales")
    public ResponseEntity<SalesReportDTO> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("API: GET /admin/reports/sales from {} to {}", startDate, endDate);
        return ResponseEntity.ok(reportService.generateSalesReport(startDate, endDate));
    }

    /**
     * getting user report data
     * @param startDate
     * @param endDate
     * @return
     */
    @GetMapping("/users")
    public ResponseEntity<UserReportDTO> getUserReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("API: GET /admin/reports/users from {} to {}", startDate, endDate);
        return ResponseEntity.ok(reportService.generateUserReport(startDate, endDate));
    }

    /**
     * generating sales report excel
     * @param startDate
     * @param endDate
     * @return
     */
    @GetMapping("/sales/export/excel")
    public ResponseEntity<byte[]> exportSalesReportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("API: GET /admin/reports/sales/export/excel");
        SalesReportDTO report = reportService.generateSalesReport(startDate, endDate);
        byte[] excelData = reportService.exportSalesReportToExcel(report);

        String filename = "sales_report_" + startDate + "_to_" + endDate + ".xlsx";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(excelData);
    }

    /**
     * generating sales report pdf
     * @param startDate
     * @param endDate
     * @return
     */
    @GetMapping("/sales/export/pdf")
    public ResponseEntity<byte[]> exportSalesReportPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("API: GET /admin/reports/sales/export/pdf");
        SalesReportDTO report = reportService.generateSalesReport(startDate, endDate);
        byte[] pdfData = reportService.exportSalesReportToPDF(report);

        String filename = "sales_report_" + startDate + "_to_" + endDate + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdfData);
    }

    /**
     * generating user report excel
     * @param startDate
     * @param endDate
     * @return
     */
    @GetMapping("/users/export/excel")
    public ResponseEntity<byte[]> exportUserReportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("API: GET /admin/reports/users/export/excel");
        UserReportDTO report = reportService.generateUserReport(startDate, endDate);
        byte[] excelData = reportService.exportUserReportToExcel(report);

        String filename = "user_report_" + startDate + "_to_" + endDate + ".xlsx";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(excelData);
    }

    /**
     * generating user report pdf
     * @param startDate
     * @param endDate
     * @return
     */
    @GetMapping("/users/export/pdf")
    public ResponseEntity<byte[]> exportUserReportPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("API: GET /admin/reports/users/export/pdf");
        UserReportDTO report = reportService.generateUserReport(startDate, endDate);
        byte[] pdfData = reportService.exportUserReportToPDF(report);

        String filename = "user_report_" + startDate + "_to_" + endDate + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdfData);
    }
}
package com.rms.service;

import com.rms.dto.SalesReportDTO;
import com.rms.dto.UserReportDTO;

import java.time.LocalDate;

public interface ReportService {

    SalesReportDTO generateSalesReport(LocalDate startDate, LocalDate endDate);

    UserReportDTO generateUserReport(LocalDate startDate, LocalDate endDate);

    byte[] exportSalesReportToExcel(SalesReportDTO report);

    byte[] exportUserReportToExcel(UserReportDTO report);

    byte[] exportSalesReportToPDF(SalesReportDTO report);

    byte[] exportUserReportToPDF(UserReportDTO report);
}
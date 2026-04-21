import type { SalesReport, UserReport } from '../types/report';
import { api } from './api';

export const reportService = {
  getSalesReport: async (startDate: string, endDate: string): Promise<SalesReport> => {
    const response = await api.request<SalesReport>(`/admin/reports/sales?startDate=${startDate}&endDate=${endDate}`);
    return response;
  },

  getUserReport: async (startDate: string, endDate: string): Promise<UserReport> => {
    const response = await api.request<UserReport>(`/admin/reports/users?startDate=${startDate}&endDate=${endDate}`);
    return response;
  },

  exportSalesReportExcel: async (startDate: string, endDate: string): Promise<Blob> => {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`http://localhost:8080/api/admin/reports/sales/export/excel?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.blob();
  },

  exportSalesReportPDF: async (startDate: string, endDate: string): Promise<Blob> => {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`http://localhost:8080/api/admin/reports/sales/export/pdf?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.blob();
  },

  exportUserReportExcel: async (startDate: string, endDate: string): Promise<Blob> => {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`http://localhost:8080/api/admin/reports/users/export/excel?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.blob();
  },

  exportUserReportPDF: async (startDate: string, endDate: string): Promise<Blob> => {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`http://localhost:8080/api/admin/reports/users/export/pdf?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.blob();
  },
};
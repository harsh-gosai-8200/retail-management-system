import { api } from './api';
import type { Invoice, PaginatedInvoices, InvoiceStats } from '../types/invoice';

export const invoiceService = {
  getSellerInvoices: async (
    sellerId: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'generatedAt,desc',
    status?: string,
    search?: string,
    startDate?: string,
    endDate?: string,
    minAmount?: number,
    maxAmount?: number
  ): Promise<PaginatedInvoices> => {
    const params: any = {
      sellerId,
      page,
      size,
      sort,
    };

    if (status) params.status = status;
    if (search) params.search = search;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (minAmount) params.minAmount = minAmount;
    if (maxAmount) params.maxAmount = maxAmount;

    const response = await api.request<PaginatedInvoices>('/invoices/seller', { params });
    
    return response;
  },

  getWholesalerInvoices: async (
    wholesalerId: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'generatedAt,desc',
    status?: string,
    search?: string,
    startDate?: string,
    endDate?: string,
    minAmount?: number,
    maxAmount?: number
  ): Promise<PaginatedInvoices> => {
    const params: any = { wholesalerId, page, size, sort };
    if (status) params.status = status;
    if (search) params.search = search;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (minAmount) params.minAmount = minAmount;
    if (maxAmount) params.maxAmount = maxAmount;

    return api.request<PaginatedInvoices>('/invoices/wholesaler', { params });
  },

  getWholesalerInvoiceStats: async (wholesalerId: number): Promise<InvoiceStats> => {
    return api.request<InvoiceStats>(`/invoices/wholesaler/stats?wholesalerId=${wholesalerId}`);
  },

  getInvoiceStats: async (sellerId: number): Promise<InvoiceStats> => {
    const response = await api.request<InvoiceStats>(`/invoices/stats?sellerId=${sellerId}`);
    return response;
  },

  getInvoiceByOrderId: async (orderId: number): Promise<Invoice> => {
    return api.request<Invoice>(`/invoices/order/${orderId}`);
  },

  downloadInvoice: async (orderId: number): Promise<Blob> => {
    const blob = await api.request<Blob>(`/invoices/download/${orderId}`, {
      method: 'GET',
      responseType: 'blob' as any,
    });
    return blob;
  },

  resendInvoice: async (orderId: number): Promise<{ message: string }> => {
    return api.request<{ message: string }>(`/invoices/resend/${orderId}`, {
      method: 'POST',
    });
  },
};
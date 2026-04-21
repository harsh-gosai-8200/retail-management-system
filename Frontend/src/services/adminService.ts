import { api } from './api';
import type { 
  AdminUser, 
  SystemLog,
  DashboardStats,
  PaginatedResponse
} from '../types/admin';
import type { PaymentTransaction } from '../types/payment';
import type { PaginatedOrdersResponse } from '../types/salesman'; 
import type { Order } from '../types/lsorder';

export const adminService = {
  
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.request<DashboardStats>('/admin/dashboard/stats');
    return response;
  },
  
  getAllUsers: async (
    role?: string,
    isActive?: boolean,
    search?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<AdminUser>> => {
    const params: any = { page, size };
    if (role) params.role = role;
    if (isActive !== undefined) params.isActive = isActive;
    if (search) params.search = search;
    
    const response = await api.request<PaginatedResponse<AdminUser>>('/admin/users', { params });
    return response;
  },

  getUserDetails: async (userId: number): Promise<AdminUser> => {
    const response = await api.request<AdminUser>(`/admin/users/${userId}`);
    return response;
  },

  toggleUserStatus: async (userId: number): Promise<AdminUser> => {
    const response = await api.request<AdminUser>(`/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
    });
    return response;
  },
  
  getAllPayments: async (
        status?: string,
        paymentMethod?: string,
        startDate?: string,
        endDate?: string,
        userId?: number,
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedResponse<PaymentTransaction>> => {
        const params: any = { page, size };
        if (status) params.status = status;
        if (paymentMethod) params.paymentMethod = paymentMethod;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (userId) params.userId = userId;
        
        const response = await api.request<PaginatedResponse<PaymentTransaction>>('/admin/payments', { params });
        return response;
    },

    getPaymentDetails: async (paymentId: number): Promise<PaymentTransaction> => {
        const response = await api.request<PaymentTransaction>(`/admin/payments/${paymentId}`);
        return response;
    },

    getUserPayments: async (
        userId: number,
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedResponse<PaymentTransaction>> => {
        const response = await api.request<PaginatedResponse<PaymentTransaction>>(`/admin/users/${userId}/payments?page=${page}&size=${size}`);
        return response;
    },


  getSalesmanOrders: async (
  salesmanId: number,
  status?: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedOrdersResponse> => {
  const params: any = { salesmanId, page, size };
  if (status) params.status = status;
  
  const response = await api.request<PaginatedOrdersResponse>('/admin/salesman-orders', { params });
  return response;
},

getAllOrders: async (
  status?: string,
  paymentStatus?: string,
  startDate?: string,
  endDate?: string,
  userId?: number,
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<Order>> => {
  const params: any = { page, size };
  if (status) params.status = status;
  if (paymentStatus) params.paymentStatus = paymentStatus;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (userId) params.userId = userId;
  
  const response = await api.request<PaginatedResponse<Order>>('/admin/orders', { params });
  return response;
},

getOrderDetails: async (orderId: number): Promise<Order> => {
  const response = await api.request<Order>(`/admin/orders/${orderId}`);
  return response;
},

getUserOrders: async (
  userId: number,
  status?: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<Order>> => {
  const params: any = { page, size };
  if (status) params.status = status;
  
  const response = await api.request<PaginatedResponse<Order>>(`/admin/users/${userId}/orders`, { params });
  return response;
},

getSystemLogs: async (
    userId?: number,
    action?: string,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<SystemLog>> => {
    const params: any = { page, size };
    if (userId) params.userId = userId;
    if (action) params.action = action;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.request<PaginatedResponse<SystemLog>>('/admin/logs', { params });
    return response;
  },

  getUserLogs: async (
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<SystemLog>> => {
    const response = await api.request<PaginatedResponse<SystemLog>>(`/admin/users/${userId}/logs?page=${page}&size=${size}`);
    return response;
  },

};
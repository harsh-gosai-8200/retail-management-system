import type { CreateOrderRequest, CreateOrderResponse, PaginatedResponse, PaymentResponse, PaymentStats, PaymentTransaction, RefundRequest, RefundResponse, VerifyPaymentRequest } from '../types/payment';
import { api } from './api';

export const paymentService = {
  createOrder: async (data: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await api.request<CreateOrderResponse>('/payments/create-order', {
      method: 'POST',
      data,
    });
    return response;
  },

  verifyPayment: async (data: VerifyPaymentRequest): Promise<PaymentResponse> => {
    const response = await api.request<PaymentResponse>('/payments/verify', {
      method: 'POST',
      data,
    });
    return response;
  },

  getTransactionByOrderId: async (orderId: number): Promise<PaymentTransaction> => {
    const response = await api.request<PaymentTransaction>(`/payments/transaction/order/${orderId}`);
    return response;
  },

  getTransactionByPaymentId: async (paymentId: string): Promise<PaymentTransaction> => {
    const response = await api.request<PaymentTransaction>(`/payments/transaction/payment/${paymentId}`);
    return response;
  },

  getUserPaymentStats: async (userId: number): Promise<PaymentStats> => {
    const response = await api.request<PaymentStats>(`/payments/stats/user/${userId}`);
    return response;
  },

  getWholesalerPaymentStats: async (wholesalerId: number): Promise<PaymentStats> => {
    const response = await api.request<PaymentStats>(`/payments/stats/wholesaler/${wholesalerId}`);
    return response;
  },

  getUserTransactions: async (
    userId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<PaymentTransaction>> => {
    const response = await api.request<PaginatedResponse<PaymentTransaction>>(
      `/payments/transactions/user/${userId}?page=${page}&size=${size}`
    );
    console.log(response);
    return response;
  },

  getWholesalerTransactions: async (
  wholesalerId: number,
  page: number = 0,
  size: number = 10,
  status?: string
): Promise<PaginatedResponse<PaymentTransaction>> => {
  const params: any = { page, size };
  if (status) params.status = status;
  
  const response = await api.request<PaginatedResponse<PaymentTransaction>>(
    `/payments/transactions/wholesaler/${wholesalerId}`,
    { params }
  );
  return response;
},

 initiateRefund: async (data: RefundRequest): Promise<RefundResponse> => {
    const response = await api.request<RefundResponse>('/payments/refund', {
      method: 'POST',
      data,
    });
    return response;
  },

  getRefundStatus: async (refundId: string): Promise<RefundResponse> => {
    const response = await api.request<RefundResponse>(`/payments/refund/${refundId}/status`);
    return response;
  },
};

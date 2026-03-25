import { api } from './api';
import type { Order, OrderSummary, PaginatedOrdersResponse } from '../types/lsorder';
import type { CheckoutRequest } from '../types/checkout';

export const orderService = {

    placeOrder: async (orderData: CheckoutRequest): Promise<Order> => {
    const response = await api.request<Order>('/orders/place', {
      method: 'POST',
      data: orderData,
    });
    return response;
  },

  // Get seller orders with pagination
  getMyOrders: async (
    sellerId: number,
    status?: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedOrdersResponse> => {
    const params: any = { sellerId, page, size };
    if (status) params.status = status;

    const response = await api.request<any>('/orders/my-orders', { params });

    return {
      orders: response.orders || [],
      currentPage: response.currentPage || 0,
      totalItems: response.totalItems || 0,
      totalPages: response.totalPages || 0,
    };
  },

  // Get order details
  getOrderDetails: async (sellerId: number, orderId: number): Promise<Order> => {
    const response = await api.request<Order>(`/orders/${orderId}?sellerId=${sellerId}`);
    return response;
  },

  // Cancel order
  cancelOrder: async (sellerId: number, orderId: number): Promise<Order> => {
    const response = await api.request<Order>(`/orders/${orderId}/cancel?sellerId=${sellerId}`, {
      method: 'POST',
    });
    return response;
  },

  // Get order summary
  getOrderSummary: async (sellerId: number): Promise<OrderSummary> => {
    const response = await api.request<OrderSummary>(`/orders/summary?sellerId=${sellerId}`);
    return response;
  },

  // Get recent orders (last 5)
  getRecentOrders: async (sellerId: number): Promise<Order[]> => {
    const response = await api.request<Order[]>(`/orders/recent?sellerId=${sellerId}`);
    return response;
  },
};
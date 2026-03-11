import { api } from './api';
import type { 
  Order, 
  OrderStats, 
  OrderFilters, 
  PageResponse,
  StatusUpdateRequest,
  RejectRequest,
  OrderApprovalResponse 
} from '../types/order';

export const orderService = {
  // Get all orders with filters
  getOrders: async (
  wholesalerId: number, 
  filters: OrderFilters
): Promise<PageResponse<Order>> => {
  const params: any = {
    wholesalerId,
    page: filters.page,
    size: filters.size,
  };

  // Map frontend sort field to backend field
  const sortField = filters.sortBy === 'orderDate' ? 'createdAt' : filters.sortBy;
  params.sort = `${sortField},${filters.sortDir}`;

  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  const response = await api.request<any>(
    `/wholesaler/orders`,
    { params }
  );

  return {
    content: response.orders || response.content || [],
    totalPages: response.totalPages,
    totalElements: response.totalItems || response.totalElements,
    size: response.size || filters.size,
    number: response.currentPage || response.number || 0,
    empty: !response.orders || response.orders.length === 0,
  };
},

  // Get pending orders
  getPendingOrders: async (
    wholesalerId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<Order>> => {
    const response = await api.request<any>(
      `/wholesaler/orders/pending`,
      { params: { wholesalerId, page, size } }
    );

    return {
      content: response.orders || response.content || [],
      totalPages: response.totalPages,
      totalElements: response.totalItems || response.totalElements,
      size: response.size || size,
      number: response.currentPage || response.number || 0,
      empty: !response.orders || response.orders.length === 0,
    };
  },

  // Get single order
  getOrder: async (wholesalerId: number, orderId: number): Promise<Order> => {
    return api.request<Order>(
      `/wholesaler/orders/${orderId}`,
      { params: { wholesalerId } }
    );
  },

  // Approve order
  approveOrder: async (
    wholesalerId: number, 
    orderId: number
  ): Promise<OrderApprovalResponse> => {
    return api.request<OrderApprovalResponse>(
      `/wholesaler/orders/${orderId}/approve`,
      {
        method: 'POST',
        params: { wholesalerId }
      }
    );
  },

  // Reject order
  rejectOrder: async (
    wholesalerId: number,
    orderId: number,
    data: RejectRequest
  ): Promise<Order> => {
    return api.request<Order>(
      `/wholesaler/orders/${orderId}/reject`,
      {
        method: 'POST',
        params: { wholesalerId },
        data
      }
    );
  },

  // Update order status
  updateStatus: async (
    wholesalerId: number,
    orderId: number,
    data: StatusUpdateRequest
  ): Promise<Order> => {
    return api.request<Order>(
      `/wholesaler/orders/${orderId}/status`,
      {
        method: 'PUT',
        params: { wholesalerId },
        data
      }
    );
  },

  // Get statistics
  getStats: async (wholesalerId: number): Promise<OrderStats> => {
    return api.request<OrderStats>(
      `/wholesaler/orders/stats`,
      { params: { wholesalerId } }
    );
  },
};
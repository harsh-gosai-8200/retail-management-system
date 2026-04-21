import { api } from './api';
import type {
  SalesmanProfile,
  AssignedSeller,
  SalesmanOrder,
  DeliveryUpdateRequest,
  DeliveryResponse,
  DashboardStats,
  PaginatedOrdersResponse
} from '../types/salesman';


const getSalesmanId = (): number => {
  const salesmanId = localStorage.getItem('profile_id');
  if (!salesmanId) {
    throw new Error('Salesman ID not found. Please login again.');
  }
  return parseInt(salesmanId, 10);
};


export const salesmanSelfService = {


  getProfile: async (): Promise<SalesmanProfile> => {
    const salesmanId = getSalesmanId();
    return api.request<SalesmanProfile>(`/salesman/profile?salesmanId=${salesmanId}`);
  },


  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    emergencyContact?: string;
    emergencyContactName?: string;
  }): Promise<SalesmanProfile> => {
    const salesmanId = getSalesmanId();
    return api.request<SalesmanProfile>(`/salesman/profile?salesmanId=${salesmanId}`, {
      method: 'PUT',
      data,
    });
  },


  getDashboardStats: async (): Promise<DashboardStats> => {
    const salesmanId = getSalesmanId();
    return api.request<DashboardStats>(`/salesman/dashboard?salesmanId=${salesmanId}`);
  },


  getAssignedSellers: async (): Promise<AssignedSeller[]> => {
    const salesmanId = getSalesmanId();
    return api.request<AssignedSeller[]>(`/salesman/assigned-sellers?salesmanId=${salesmanId}`);
  },


  getOrders: async (status?: string, page: number = 0, size: number = 10): Promise<PaginatedOrdersResponse> => {
    const salesmanId = getSalesmanId();
    const params: any = { salesmanId, page, size };
    if (status) params.status = status;

    const response = await api.request<PaginatedOrdersResponse>('/salesman/orders', { params });
    console.log('Orders response:', response);
    return response;
  },


  getSellerOrders: async (sellerId: number, status?: string): Promise<SalesmanOrder[]> => {
    const salesmanId = getSalesmanId();
    const params: any = { salesmanId };
    if (status) params.status = status;
    return api.request<SalesmanOrder[]>(`/salesman/sellers/${sellerId}/orders`, { params });
  },


  getOrderDetails: async (orderId: number): Promise<SalesmanOrder> => {
    const salesmanId = getSalesmanId();
    return api.request<SalesmanOrder>(`/salesman/orders/${orderId}?salesmanId=${salesmanId}`);
  },



  markAsDelivered: async (orderId: number, data: DeliveryUpdateRequest): Promise<DeliveryResponse> => {
    const salesmanId = getSalesmanId();
    return api.request<DeliveryResponse>(`/salesman/orders/${orderId}/deliver?salesmanId=${salesmanId}`, {
      method: 'POST',
      data,
    });
  },


  updateDeliveryStatus: async (orderId: number, status: string, notes?: string): Promise<DeliveryResponse> => {
    const salesmanId = getSalesmanId();
    const params: any = { salesmanId, status };
    if (notes) params.notes = notes;
    
    return api.request<DeliveryResponse>(`/salesman/orders/${orderId}/delivery-status`, {
      method: 'PATCH',
      params: { status, notes },
    });
  },

  collectCashPayment: async (orderId: number, amountCollected: number): Promise<DeliveryResponse> => {
    const salesmanId = getSalesmanId();
    return api.request<DeliveryResponse>(`/salesman/orders/${orderId}/collect-cash?salesmanId=${salesmanId}&amountCollected=${amountCollected}`, {
      method: 'POST',
    });
  },

  getOrdersBySalesmanId: async (
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

getOrderDetailsForAdmin: async (orderId: number, salesmanId: number): Promise<SalesmanOrder> => {
  return api.request<SalesmanOrder>(`/salesman/orders/${orderId}?salesmanId=${salesmanId}`);
},
};
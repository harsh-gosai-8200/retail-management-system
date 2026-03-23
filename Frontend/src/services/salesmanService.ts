import { api } from './api';
import type { 
  Salesman, 
  SalesmanListResponse,
  SalesmanRegistrationRequest,
  SalesmanUpdateRequest,
  Seller,
  SalesmanAssignment,
  AssignmentRequest ,
  PaginatedResponse
} from '../types/wholesalerSalesman';

export const salesmanService = {

  getSalesmen: async (
    wholesalerId: number,
    page: number = 0,
    size: number = 10,
    search?: string,
    isActive?: boolean,
    region?: string
  ): Promise<SalesmanListResponse> => {
    const params: any = { wholesalerId, page, size };
    if (search) params.search = search;
    if (isActive !== undefined) params.isActive = isActive;
    if (region) params.region = region;

    const response = await api.request<any>('/wholesaler/salesmen', { params });
    
    return {
      salesmen: response.content || response.salesmen || [],
      currentPage: response.number || response.currentPage || 0,
      totalItems: response.totalElements || response.totalItems || 0,
      totalPages: response.totalPages || 0,
    };
  },

  getSalesman: async (wholesalerId: number, salesmanId: number): Promise<Salesman> => {
    return api.request<Salesman>(`/wholesaler/salesmen/${salesmanId}`, {
      params: { wholesalerId },
    });
  },

  createSalesman: async (wholesalerId: number, data: SalesmanRegistrationRequest): Promise<Salesman> => {
    return api.request<Salesman>('/wholesaler/salesmen', {
      method: 'POST',
      params: { wholesalerId },
      data,
    });
  },

  updateSalesman: async (
    wholesalerId: number,
    salesmanId: number,
    data: SalesmanUpdateRequest
  ): Promise<Salesman> => {
    return api.request<Salesman>(`/wholesaler/salesmen/${salesmanId}`, {
      method: 'PUT',
      params: { wholesalerId },
      data,
    });
  },

  toggleStatus: async (wholesalerId: number, salesmanId: number, active: boolean): Promise<Salesman> => {
    return api.request<Salesman>(`/wholesaler/salesmen/${salesmanId}/status`, {
      method: 'PATCH',
      params: { wholesalerId, active },
    });
  },

  getAvailableSellers: async (wholesalerId: number): Promise<Seller[]> => {
    const response = await api.request<any>('/wholesaler/salesmen/available-sellers', {
      params: { wholesalerId },
    });
 
    if (Array.isArray(response)) {
      return response;
    }
    if (response && response.content && Array.isArray(response.content)) {
      return response.content;
    }
    return [];
  },

  getAssignedSellers: async (wholesalerId: number, salesmanId: number): Promise<SalesmanAssignment[]> => {
    const response = await api.request<any>(
      `/wholesaler/salesmen/${salesmanId}/assigned-sellers`,
      { params: { wholesalerId } }
    );
    
    console.log('📥 Assigned sellers raw response:', response);
    
    if (response && response.content && Array.isArray(response.content)) {
      return response.content;
    }
    
    if (Array.isArray(response)) {
      return response;
    }
    
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('Unexpected assigned sellers response format:', response);
    return [];
  },

  assignSellers: async (wholesalerId: number, data: AssignmentRequest): Promise<{ message: string }> => {
    return api.request<{ message: string }>('/wholesaler/salesmen/assign', {
      method: 'POST',
      params: { wholesalerId },
      data,
    });
  },

  removeAssignment: async (wholesalerId: number, assignmentId: number): Promise<void> => {
    return api.request<void>(`/wholesaler/salesmen/assignments/${assignmentId}`, {
      method: 'DELETE',
      params: { wholesalerId },
    });
  },

  getAssignedCount: async (salesmanId: number): Promise<number> => {
    const response = await api.request<{ count: number }>(
      `/wholesaler/salesmen/${salesmanId}/assigned-count`
    );
    return response.count;
  },

  getAllAssignments: async (wholesalerId: number): Promise<SalesmanAssignment[]> => {
    const salesmenResponse = await salesmanService.getSalesmen(wholesalerId, 0, 100);
    const salesmen = salesmenResponse.salesmen;
    
    const allAssignments: SalesmanAssignment[] = [];
    
    for (const salesman of salesmen) {
      const assignments = await salesmanService.getAssignedSellers(wholesalerId, salesman.id);
      allAssignments.push(...assignments);
    }
    
    return allAssignments;
},
};
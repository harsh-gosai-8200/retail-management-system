export interface Salesman {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  employeeId: string;
  region: string;
  department?: string;
  commissionRate?: number;
  salary?: number;
  status: 'ACTIVE' | 'INACTIVE';
  assignedSellersCount: number;
  createdAt: string;
}

export interface SalesmanListResponse {
  salesmen: Salesman[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface SalesmanRegistrationRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  region: string;
  department?: string;
  commissionRate?: number;
  salary?: number;
  employeeId?: string;
  aadharNumber?: string;
  panNumber?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  joiningDate?: Date;
}

export interface SalesmanUpdateRequest {
  fullName?: string;
  phone?: string;
  region?: string;
  department?: string;
  commissionRate?: number;
  salary?: number;
  emergencyContact?: string;
  emergencyContactName?: string;
  isActive?: boolean;
}

export interface Seller {
  id: number;
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
}

export interface SalesmanAssignment {
  id: number;
  salesmanId: number;
  salesmanName: string;
  sellerId: number;
  sellerName: string;
  sellerShop: string;
  assignedAt: string;
  status: string;
}

export interface AssignmentRequest {
  salesmanId: number;
  sellerIds: number[];
}

export interface PaginatedResponse<T> {
  content: T[];           
  currentPage: number;     
  totalItems: number;      
  totalPages: number;      
  pageSize?: number;      
  last?: boolean;          
}
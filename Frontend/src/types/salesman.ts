export interface SalesmanProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  employeeId: string;
  region: string;
  department?: string;
  commissionRate?: number;
  salary?: number;
  wholesalerName: string;
  wholesalerAddress: string;
  wholesalerPhone: string;
  assignedSellersCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  emergencyContact?: string;
  emergencyContactName?: string;
}

export interface AssignedSeller {
  sellerId: number;
  shopName: string;
  ownerName: string;
  phone: string;
  address: string;
  pendingOrders: number;
  totalOrders: number;
  lastOrderDate: string;
}

export interface SalesmanOrder {
  orderId: number;
  orderNumber: string;
  sellerId: number;
  sellerName: string;
  sellerShop: string;
  sellerPhone: string;
  sellerAddress: string;
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  deliveryAddress: string;
  itemCount: number;
  items?: SalesmanOrderItem[];
}

export interface SalesmanOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface DeliveryUpdateRequest {
  status: 'DELIVERED' | 'PARTIALLY_DELIVERED' | 'FAILED' | 'RETURNED';
  notes?: string;
  receiverName?: string;
  receiverPhone?: string;
  deliveryPhoto?: string;
}

export interface DeliveryResponse {
  orderId: number;
  orderNumber: string;
  status: string;
  deliveredAt: string;
  receiverName?: string;
  receiverPhone?: string;
  notes?: string;
  message: string;
}

export interface DashboardStats {
  totalAssignedSellers: number;
  pendingDeliveries: number;
  completedToday: number;
  totalCompleted: number;
  totalCollection: number;
  estimatedCommission: number;
}

export interface PaginatedOrdersResponse {
  content: SalesmanOrder[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
}
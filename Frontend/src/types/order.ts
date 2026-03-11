export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
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

export interface Order {
  id: number;
  orderNumber: string;
  sellerId: number;
  sellerName: string;
  sellerShopName: string;
  wholesalerId: number;
  wholesalerName: string;
  items: OrderItem[];
  totalItems: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  updatedAt: string;
  deliveryAddress: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  rejectedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
}

export interface StatusUpdateRequest {
  status: OrderStatus;
  comments?: string;
  trackingNumber?: string;
}

export interface RejectRequest {
  reason: string;
  comments?: string;
  notifySeller?: boolean;
}

export interface OrderApprovalResponse {
  orderId: number;
  orderNumber: string;
  status: string;
  approvedAt: string;
  approvedBy: string;
  message: string;
}
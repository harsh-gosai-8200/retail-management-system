export type OrderStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  total: number;
}

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
  deliveryInstructions?: string;
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  averageOrderValue: number;
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
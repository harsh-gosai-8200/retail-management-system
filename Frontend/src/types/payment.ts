export interface PaymentTransaction {
  id: number;
  orderId: number;
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'DISPUTED';
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET';
  createdAt: string;
  paidAt: string | null;
  isRefunded: boolean;
  refundAmount: number | null;
  refundId?: string;
  failureReason: string | null;
}

export interface PaymentStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  totalAmount: number;
}

export interface CreateOrderRequest {
  orderId: number;
  amount: number;
  currency?: string;
}

export interface CreateOrderResponse {
  razorpayOrderId: string;
  razorpayKeyId: string;
  orderId: number;
  orderNumber: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: number;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  orderId: number;
  orderNumber?: string;
  paymentId?: string;
  status?: string;
  transactionId?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  amount?: number;
  status?: string;
  message: string;
}
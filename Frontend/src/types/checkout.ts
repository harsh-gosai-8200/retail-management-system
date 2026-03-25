export interface CheckoutRequest {
  wholesalerId: number;
  sellerId: number;
  items: CheckoutItem[];
  deliveryAddress?: string;
  deliveryInstructions?: string;
  paymentMethod?: string;  // CASH, UPI, BANK_TRANSFER
  upiId?: string;
}

export interface CheckoutItem {
  productId: number;
  quantity: number;
}

export interface CheckoutSummary {
  items: CheckoutItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  wholesalerId: number;
  wholesalerName: string;
}
export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number;
  orderNumber: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'GENERATED' | 'PENDING' | 'PAID' | 'OVERDUE';
  pdfUrl: string;
  generatedAt: string;
  paidAt?: string;
}

export interface PaginatedInvoices {
  content: Invoice[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
  first: boolean;
  last: boolean;
}

export interface InvoiceStats {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
  totalAmount: number;
}

export interface InvoiceFilters {
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page: number;
  size: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}
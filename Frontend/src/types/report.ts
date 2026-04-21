export interface DailySales {
  date: string;
  ordersCount: number;
  revenue: number;
}

export interface PaymentMethodSummary {
  paymentMethod: string;
  count: number;
  amount: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface TopSeller {
  sellerId: number;
  sellerName: string;
  shopName: string;
  ordersCount: number;
  totalSpent: number;
}

export interface SalesReport {
  startDate: string;
  endDate: string;
  generatedAt: string;
  totalRevenue: number;
  totalCommission: number;
  netRevenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  dailySales: DailySales[];
  paymentMethodSummary: PaymentMethodSummary[];
  topProducts: TopProduct[];
  topSellers: TopSeller[];
}

export interface UserRegistration {
  date: string;
  wholesalers: number;
  localSellers: number;
  salesmen: number;
  total: number;
}

export interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

export interface UserReport {
  startDate: string;
  endDate: string;
  generatedAt: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  wholesalersCount: number;
  localSellersCount: number;
  salesmenCount: number;
  adminsCount: number;
  newRegistrations: UserRegistration[];
  roleDistribution: RoleDistribution[];
}

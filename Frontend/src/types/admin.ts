export interface AdminUser {
  id: number;
  profileId: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  businessName?: string;
  shopName?: string;
  region?: string;
}



export interface SystemLog {
  id: number;
  userId?: number;
  userName?: string;
  userRole?: string;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeWholesalers: number;
  activeLocalSellers: number;
  activeSalesmen: number;
  inactiveUsers: number;
  totalOrders: number;
  ordersToday: number;
  revenueToday: number;
  revenueThisMonth: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  totalSubscriptionRevenue: number;
  openTickets: number;
  highPriorityTickets: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
}
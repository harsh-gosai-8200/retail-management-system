import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Store, 
  ShoppingCart, 
  IndianRupee,
  Ticket,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminStatsCard } from '../../components/admin/AdminStatsCard';
import { Button } from '../../components/ui/button';
import type { DashboardStats } from '../../types/admin';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeWholesalers: 0,
    activeLocalSellers: 0,
    activeSalesmen: 0,
    inactiveUsers: 0,
    totalOrders: 0,
    ordersToday: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalSubscriptionRevenue: 0,
    openTickets: 0,
    highPriorityTickets: 0
});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
        const data = await adminService.getDashboardStats();
        setStats({
            totalUsers: data?.totalUsers ?? 0,
            activeWholesalers: data?.activeWholesalers ?? 0,
            activeLocalSellers: data?.activeLocalSellers ?? 0,
            activeSalesmen: data?.activeSalesmen ?? 0,
            inactiveUsers: data?.inactiveUsers ?? 0,
            totalOrders: data?.totalOrders ?? 0,
            ordersToday: data?.ordersToday ?? 0,
            revenueToday: data?.revenueToday ?? 0,
            revenueThisMonth: data?.revenueThisMonth ?? 0,
            activeSubscriptions: data?.activeSubscriptions ?? 0,
            expiredSubscriptions: data?.expiredSubscriptions ?? 0,
            totalSubscriptionRevenue: data?.totalSubscriptionRevenue ?? 0,
            openTickets: data?.openTickets ?? 0,
            highPriorityTickets: data?.highPriorityTickets ?? 0
        });
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' as const },
    { label: 'Wholesalers', value: stats.activeWholesalers, icon: Store, color: 'indigo' as const },
    { label: 'Local Sellers', value: stats.activeLocalSellers, icon: Store, color: 'green' as const },
    { label: 'Salesmen', value: stats.activeSalesmen, icon: Users, color: 'purple' as const },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'blue' as const },
    { label: 'Orders Today', value: stats.ordersToday, icon: ShoppingCart, color: 'green' as const },
    { label: 'Revenue Today', value: stats.revenueToday, icon: IndianRupee, color: 'green' as const, prefix: '₹' },
    { label: 'Revenue This Month', value: stats.revenueThisMonth, icon: TrendingUp, color: 'purple' as const, prefix: '₹' },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions, icon: Users, color: 'indigo' as const },
    { label: 'Open Tickets', value: stats.openTickets, icon: Ticket, color: 'yellow' as const },
    { label: 'High Priority', value: stats.highPriorityTickets, icon: AlertCircle, color: 'red' as const },
    { label: 'Subscription Revenue', value: stats.totalSubscriptionRevenue, icon: IndianRupee, color: 'blue' as const, prefix: '₹' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your platform
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadStats}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <AdminStatsCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
            prefix={card.prefix}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => navigate('/admin/users')}
          className="group rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Users className="h-8 w-8 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">User Management</h3>
          <p className="mt-1 text-sm text-slate-500">
            View and manage all users
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/tickets')}
          className="group rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Ticket className="h-8 w-8 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Support Tickets</h3>
          <p className="mt-1 text-sm text-slate-500">
            {stats.openTickets} open tickets need attention
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/reports')}
          className="group rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Generate Reports</h3>
          <p className="mt-1 text-sm text-slate-500">
            Download sales and user reports
          </p>
        </button>
      </div>
    </div>
  );
}
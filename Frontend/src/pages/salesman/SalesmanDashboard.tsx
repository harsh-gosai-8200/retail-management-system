import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { salesmanSelfService } from '../../services/salesmanSelfService';
import type { DashboardStats } from '../../types/salesman';

export function SalesmanDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await salesmanSelfService.getDashboardStats();
      setStats(data);
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

  const statCards = [
    {
      label: 'Assigned Sellers',
      value: stats?.totalAssignedSellers || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pending Deliveries',
      value: stats?.pendingDeliveries || 0,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Completed Today',
      value: stats?.completedToday || 0,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Completed',
      value: stats?.totalCompleted || 0,
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Total Collection',
      value: `₹${(stats?.totalCollection || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Estimated Commission',
      value: `₹${(stats?.estimatedCommission || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Salesman Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back! Here's your overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          onClick={() => navigate('/salesman/assigned-sellers')}
          className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Users className="h-8 w-8 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">View Assigned Sellers</h3>
          <p className="mt-1 text-sm text-slate-500">
            See all sellers assigned to you
          </p>
        </button>

        <button
          onClick={() => navigate('/salesman/orders')}
          className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Package className="h-8 w-8 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">View Orders</h3>
          <p className="mt-1 text-sm text-slate-500">
            Check pending and completed orders
          </p>
        </button>
      </div>
    </div>
  );
}
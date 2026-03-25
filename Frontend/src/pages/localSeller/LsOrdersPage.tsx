import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  Store,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/lsOrderService';
import { OrderStatusBadge } from '../salesman/component/OrderStatusBadge';  
import { Button } from '../../components/ui/button';
import type { Order, OrderSummary } from '../../types/lsorder';

const PAGE_SIZE = 10;

export function LsOrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sellerId = user?.id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (sellerId) {
      loadOrders();
      loadSummary();
    }
  }, [sellerId, statusFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getMyOrders(
        sellerId!,
        statusFilter || undefined,
        page,
        PAGE_SIZE
      );
      
      console.log('Orders response:', response);
      setOrders(response.orders);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (err: any) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await orderService.getOrderSummary(sellerId!);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const handleFilterChange = (filterValue: string) => {
    setPage(0);
    setStatusFilter(filterValue);
  };

  const pageNumber = page + 1;

  const filters = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  if (loading && orders.length === 0) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and track all your orders
        </p>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Total Orders</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{summary.totalOrders}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Pending</p>
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-yellow-600">{summary.pendingOrders}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Delivered</p>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-green-600">{summary.deliveredOrders}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Cancelled</p>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-red-600">{summary.cancelledOrders}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Total Spent</p>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-purple-600">₹{summary.totalSpent.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              statusFilter === filter.value
                ? filter.value === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : filter.value === 'APPROVED'
                  ? 'bg-blue-600 text-white'
                  : filter.value === 'PROCESSING'
                  ? 'bg-purple-600 text-white'
                  : filter.value === 'SHIPPED'
                  ? 'bg-indigo-600 text-white'
                  : filter.value === 'DELIVERED'
                  ? 'bg-green-600 text-white'
                  : filter.value === 'CANCELLED'
                  ? 'bg-gray-600 text-white'
                  : filter.value === 'REJECTED'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No orders found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {statusFilter ? 'No orders match the selected filter' : 'Start shopping to see your orders here'}
          </p>
          {!statusFilter && (
            <button
              onClick={() => navigate('/local-seller/wholesalers')}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Browse Wholesalers
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/local-seller/orders/${order.id}`)}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-slate-100 p-3">
                    <Package className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{order.orderNumber}</h3>
                    <p className="text-sm text-slate-500">
                      <Store className="inline h-3 w-3 mr-1" />
                      {order.wholesalerName} · {order.totalItems} items · ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.orderDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {order.deliveryAddress}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <footer className="flex items-center justify-between text-xs text-slate-500">
          <p>
            Page <span className="font-semibold text-slate-900">{pageNumber}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span> ·{' '}
            <span className="font-semibold text-slate-900">{totalItems}</span> total orders
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-xl"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
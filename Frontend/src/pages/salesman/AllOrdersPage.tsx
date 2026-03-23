// src/pages/salesman/AllOrdersPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  Store,
  ChevronRight
} from 'lucide-react';
import { salesmanSelfService } from '../../services/salesmanSelfService';
import { OrderStatusBadge } from './component/OrderStatusBadge';
import { Button } from '../../components/ui/button';
import type { SalesmanOrder } from '../../types/salesman';

const PAGE_SIZE = 10;

export function AllOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesmanOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await salesmanSelfService.getOrders(statusFilter, page, PAGE_SIZE);
      console.log('Orders response:', response);
      
      if (response && response.content) {
        setOrders(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else if (Array.isArray(response)) {
        setOrders(response);
        setTotalPages(1);
        setTotalElements(response.length);
      } else {
        setOrders([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err: any) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
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
    { value: 'SHIPPED', label: 'To Deliver' },
    { value: 'DELIVERED', label: 'Delivered' },
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
        <h1 className="text-2xl font-bold text-slate-900">All Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all orders from your assigned sellers
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              statusFilter === filter.value
                ? filter.value === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : filter.value === 'SHIPPED'
                  ? 'bg-indigo-600 text-white'
                  : filter.value === 'DELIVERED'
                  ? 'bg-green-600 text-white'
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
            There are no orders matching your filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              onClick={() => navigate(`/salesman/orders/${order.orderId}`)}
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
                      {order.sellerShop} · {order.itemCount} items · ₹{order.totalAmount.toLocaleString()}
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

              {order.status === 'SHIPPED' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/salesman/orders/${order.orderId}/deliver`);
                    }}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Mark as Delivered
                  </button>
                </div>
              )}
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
            <span className="font-semibold text-slate-900">{totalElements}</span> total orders
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
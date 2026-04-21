import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  Calendar,
  IndianRupee,
  User,
  ArrowLeft,
  CreditCard,
  CheckCircle,
  Clock,
  Store
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { salesmanSelfService } from '../../services/salesmanSelfService';
import { Button } from '../../components/ui/button';
import type { SalesmanOrder } from '../../types/salesman';

const PAGE_SIZE = 10;

export function AdminSalesmanCollectionsPage() {
  const { salesmanId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesmanOrder[]>([]);
  const [salesmanInfo, setSalesmanInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (salesmanId) {
      loadSalesmanInfo();
      loadOrders();
    }
  }, [salesmanId, page]);

  const loadSalesmanInfo = async () => {
    try {
      const data = await adminService.getUserDetails(parseInt(salesmanId!));
      setSalesmanInfo(data);
    } catch (err) {
      console.error('Failed to load salesman info:', err);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSalesmanOrders(
      parseInt(salesmanId!), 
      'DELIVERED', 
      page, 
      PAGE_SIZE
    );
      setOrders(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalItems || 0);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const pageNumber = page + 1;

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Delivery Collections</h1>
      </div>

      {/* Salesman Info */}
      {salesmanInfo && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{salesmanInfo.username}</h2>
              <p className="text-sm text-slate-500">{salesmanInfo.email}</p>
              {salesmanInfo.region && (
                <p className="text-xs text-slate-400 mt-1">Region: {salesmanInfo.region}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Deliveries</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalElements}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">COD Orders</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.paymentMethod === 'CASH').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Online Payments</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {orders.filter(o => o.paymentMethod !== 'CASH').length}
          </p>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No deliveries found</h3>
          <p className="mt-2 text-sm text-slate-500">
            This salesman hasn't delivered any orders yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCOD = order.paymentMethod === 'CASH';
            const isPaid = order.paymentStatus === 'PAID';
            
            return (
              <div
  key={order.orderId}
  onClick={() => navigate(`/admin/salesman-collections/${salesmanId}/order/${order.orderId}`)}
  className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-full p-3 ${
                      isCOD ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {isCOD ? (
                        <DollarSign className={`h-6 w-6 ${isCOD ? 'text-yellow-600' : 'text-green-600'}`} />
                      ) : (
                        <CreditCard className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{order.orderNumber}</h3>
                      <p className="text-sm text-slate-500">
                        <Store className="inline h-3 w-3 mr-1" />
                        {order.sellerShop} • {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      isCOD 
                        ? isPaid 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isCOD 
                        ? (isPaid ? 'Cash Collected' : 'Pending Collection')
                        : 'Online Payment'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Delivered: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : '-'}
                  </div>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    Amount: ₹{order.totalAmount.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    {isCOD ? (
                      <>
                        <DollarSign className="h-4 w-4 text-yellow-500" />
                        <span>COD - {isPaid ? 'Collected' : 'Pending'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Prepaid</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <footer className="flex items-center justify-between text-xs text-slate-500">
          <p>
            Page <span className="font-semibold text-slate-900">{pageNumber}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span> ·{' '}
            <span className="font-semibold text-slate-900">{totalElements}</span> total deliveries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-xl"
            >
              Previous
            </Button>
            <Button
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
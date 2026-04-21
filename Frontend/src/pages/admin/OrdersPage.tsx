import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Package, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  Calendar,
  IndianRupee,
  User,
  Store
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import { Button } from '../../components/ui/button';
import type { Order } from '../../types/order';

const PAGE_SIZE = 10;

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REJECTED', label: 'Rejected' },
];

const paymentStatusOptions = [
  { value: '', label: 'All Payment' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
];

export function AdminOrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');
  const userRoleFromUrl = searchParams.get('role');
  const profileIdFromUrl = searchParams.get('profileId');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);

  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState<number | undefined>(userIdFromUrl ? parseInt(userIdFromUrl) : undefined);
  const [profileId, setProfileId] = useState<number | undefined>(
  profileIdFromUrl ? parseInt(profileIdFromUrl) : undefined
);
  const [userRole, setUserRole] = useState<string | undefined>(userRoleFromUrl || undefined);

  useEffect(() => {
    if (userId) {
      adminService.getUserDetails(userId).then(setUserInfo).catch(console.error);
    } else {
      setUserInfo(null);
    }
  }, [userId]);

  useEffect(() => {
    loadOrders();
  }, [page, status, paymentStatus, startDate, endDate, userId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let response;
      
      if (profileId) {
        response = await adminService.getUserOrders(profileId, status || undefined, page, PAGE_SIZE);
      } else {
        response = await adminService.getAllOrders(
          status || undefined,
          paymentStatus || undefined,
          startDate || undefined,
          endDate || undefined,
          undefined,
          page,
          PAGE_SIZE
        );
      }
      
      setOrders(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStatus('');
    setPaymentStatus('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleClearUserFilter = () => {
    setUserId(undefined);
    setPage(0);
    navigate('/admin/orders');
  };

  const pageNumber = page + 1;
  const hasFilters = status || paymentStatus || startDate || endDate || userId;

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all orders
        </p>
      </div>

      {/* User Filter Banner */}
      {userId && userInfo && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">
                Showing orders for: <strong>{userInfo.username}</strong> ({userInfo.email})
              </span>
            </div>
            <button
              onClick={handleClearUserFilter}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {!userId && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-40">
              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-slate-500 mb-1">Payment</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                {paymentStatusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </div>
            <Button variant="outline" onClick={handleClearFilters} className="h-10">
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No orders found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {hasFilters ? 'Try adjusting your filters' : 'No orders available'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/admin/orders/${order.id}`)}
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
                      {order.sellerShopName} • {order.totalItems} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.orderDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  Amount: ₹{order.totalAmount.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  Seller: {order.sellerShopName}
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
            <span className="font-semibold text-slate-900">{totalElements}</span> total orders
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
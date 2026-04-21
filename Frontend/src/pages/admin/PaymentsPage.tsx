import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  Calendar,
  IndianRupee,
  User,
  Search
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { adminService } from '../../services/adminService';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import { Button } from '../../components/ui/button';
import type { PaymentTransaction } from '../../types/payment';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 10;

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const paymentMethodOptions = [
  { value: '', label: 'All Methods' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'NET_BANKING', label: 'Net Banking' },
];

export function AdminPaymentsPage() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');      
const profileIdFromUrl = searchParams.get('profileId');
const userRoleFromUrl = searchParams.get('role');

const profileId = profileIdFromUrl ? parseInt(profileIdFromUrl) : undefined;
  
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Filter state
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState<number | undefined>(userIdFromUrl ? parseInt(userIdFromUrl) : undefined);
  const [userRole, setUserRole] = useState<string | undefined>(userRoleFromUrl || undefined);

  // Load user info if filtering by user
  useEffect(() => {
    if (userId) {
      adminService.getUserDetails(userId).then(setUserInfo).catch(console.error);
    } else {
      setUserInfo(null);
    }
  }, [userId]);

  useEffect(() => {
    loadPayments();
  }, [page, status, paymentMethod, startDate, endDate, userId, profileId, userRole]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      let response;
      
      if (profileId && userId) {
      if (userRole === 'LOCAL_SELLER') {
        response = await adminService.getUserPayments(profileId, page, PAGE_SIZE);
      } else if (userRole === 'WHOLESALER') {
        response = await paymentService.getWholesalerTransactions(profileId, page, PAGE_SIZE);
      } else {
        console.log("there is issue")
        response = await adminService.getUserPayments(userId, page, PAGE_SIZE);
      }
    } else {
      response = await adminService.getAllPayments(
        status || undefined,
        paymentMethod || undefined,
        startDate || undefined,
        endDate || undefined,
        undefined,
        page,
        PAGE_SIZE
      );
    }
      
      setPayments(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      console.error('Error loading payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStatus('');
    setPaymentMethod('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleClearUserFilter = () => {
    setUserId(undefined);
    setPage(0);
    navigate('/admin/payments');
  };

  const pageNumber = page + 1;
  const hasFilters = status || paymentMethod || startDate || endDate || userId;

  if (loading && payments.length === 0) {
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
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all payment transactions
        </p>
      </div>

      {/* User Filter Banner */}
      {userId && userInfo && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">
                Showing payments for: <strong>{userInfo.username}</strong> ({userInfo.email})
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

      {/* Filters  */}
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
              <label className="block text-xs font-medium text-slate-500 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                {paymentMethodOptions.map(opt => (
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

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{payments.length}</span> of{' '}
          <span className="font-medium text-slate-700">{totalElements}</span> payments
        </p>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No payments found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {hasFilters ? 'Try adjusting your filters' : 'No payment transactions yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              onClick={() => navigate(`/admin/payments/${payment.id}`)}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-slate-100 p-3">
                    <CreditCard className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Order #{payment.orderNumber}</h3>
                    <p className="text-sm text-slate-500">
                      Transaction: {payment.razorpayPaymentId?.slice(0, 12)}...
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {payment.paymentMethod} • {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      ₹{payment.amount.toLocaleString()}
                    </p>
                    <AdminStatusBadge status={payment.status} type="payment" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(payment.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  Amount: ₹{payment.amount.toLocaleString()}
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
            <span className="font-semibold text-slate-900">{totalElements}</span> total payments
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
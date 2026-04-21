// src/pages/wholesaler/PaymentsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard,
  Loader2,
  AlertCircle,
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import { Button } from '../../components/ui/button';
import type { PaymentTransaction, PaymentStats } from '../../types/payment';

const PAGE_SIZE = 10;

const statusColors: Record<string, { color: string; bg: string; label: string }> = {
  SUCCESS: { color: 'text-green-800', bg: 'bg-green-100', label: 'Success' },
  FAILED: { color: 'text-red-800', bg: 'bg-red-100', label: 'Failed' },
  REFUNDED: { color: 'text-gray-800', bg: 'bg-gray-100', label: 'Refunded' },
};

function PaymentStatusBadge({ status }: { status: string }) {
  const config = statusColors[status] || statusColors.PENDING;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

export function WholesalerPaymentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const wholesalerId = user?.id;

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (wholesalerId) {
      loadTransactions();
      loadStats();
    }
  }, [wholesalerId, statusFilter, page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getWholesalerTransactions(
        wholesalerId!,
        page,
        PAGE_SIZE,
        statusFilter || undefined
      );
      setTransactions(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await paymentService.getWholesalerPaymentStats(wholesalerId!);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleFilterChange = (filterValue: string) => {
    setPage(0);
    setStatusFilter(filterValue);
  };

  const pageNumber = page + 1;

  const filters = [
    { value: '', label: 'All' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REFUNDED', label: 'Refunded' },
  ];

  if (loading && transactions.length === 0) {
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
        <h1 className="text-2xl font-bold text-slate-900">Payments Received</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all payments from orders placed with you
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Total Transactions</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{stats.totalTransactions}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Successful</p>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-green-600">{stats.successfulTransactions}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Failed</p>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-red-600">{stats.failedTransactions}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Refunded</p>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-gray-600">{stats.refundedTransactions}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">Total Received</p>
              <IndianRupee className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-purple-600">₹{stats.totalAmount.toLocaleString()}</p>
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
                ? filter.value === 'SUCCESS'
                  ? 'bg-green-600 text-white'
                  : filter.value === 'FAILED'
                  ? 'bg-red-600 text-white'
                  : filter.value === 'REFUNDED'
                  ? 'bg-gray-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No payments found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {statusFilter ? 'No payments match the selected filter' : 'Payments will appear here once orders are placed'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              onClick={() => navigate(`/wholesaler/orders/${txn.orderId}`)}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-slate-100 p-3">
                    <CreditCard className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Order #{txn.orderNumber}</h3>
                    <p className="text-sm text-slate-500">
                      Transaction: {txn.razorpayPaymentId?.slice(0, 12)}...
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {txn.paymentMethod} • {new Date(txn.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PaymentStatusBadge status={txn.status} />
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(txn.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  Amount: ₹{txn.amount.toLocaleString()}
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
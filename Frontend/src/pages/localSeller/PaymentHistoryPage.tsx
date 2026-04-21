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
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { paymentService } from '../../services/paymentService';
import { Button } from '../../components/ui/button';
import type { PaymentTransaction, PaymentStats } from '../../types/payment';

const PAGE_SIZE = 10;

const statusColors: Record<string, { color: string; bg: string; label: string }> = {
  SUCCESS: { color: 'text-green-800', bg: 'bg-green-100', label: 'Success' },
  PENDING: { color: 'text-yellow-800', bg: 'bg-yellow-100', label: 'Pending' },
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

export function PaymentHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (userId) {
      loadTransactions();
      loadStats();
    }
  }, [userId, page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getUserTransactions(userId!, page, PAGE_SIZE);
    console.log('Transactions response:', response);
    setTransactions(response.content);
    setTotalPages(response.totalPages);
    setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await paymentService.getUserPaymentStats(userId!);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all your payment transactions
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
              <p className="text-xs text-slate-500">Total Spent</p>
              <IndianRupee className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-purple-600">₹{stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No transactions found</h3>
          <p className="mt-2 text-sm text-slate-500">
            Your payment history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              onClick={() => navigate(`/local-seller/orders/${txn.orderId}`)}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-slate-100 p-3">
                    <CreditCard className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{txn.orderNumber}</h3>
                    <p className="text-sm text-slate-500">
                      Transaction ID: {txn.razorpayPaymentId?.slice(0, 12)}...
                    </p>
                  </div>
                </div>
                <PaymentStatusBadge status={txn.status} />
              </div>

              <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(txn.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  ₹{txn.amount.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Method:</span>
                  {txn.paymentMethod}
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
            Page <span className="font-semibold text-slate-900">{page + 1}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span> ·{' '}
            <span className="font-semibold text-slate-900">{totalElements}</span> total transactions
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
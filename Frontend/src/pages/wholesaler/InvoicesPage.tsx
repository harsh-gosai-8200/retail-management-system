import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  IndianRupee,
  ChevronRight,
  Download,
  Eye,
  Store,
  Mail,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import type { Invoice } from '../../types/invoice';
import { invoiceService } from '../../services/invoiceService';

const PAGE_SIZE = 10;

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  GENERATED: { color: 'text-blue-800', bg: 'bg-blue-100', label: 'Generated' },
  PENDING: { color: 'text-yellow-800', bg: 'bg-yellow-100', label: 'Pending' },
  PAID: { color: 'text-green-800', bg: 'bg-green-100', label: 'Paid' },
  OVERDUE: { color: 'text-red-800', bg: 'bg-red-100', label: 'Overdue' },
};

function InvoiceStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

export function WholesalerInvoicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const wholesalerId = user?.id;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [resendingId, setResendingId] = useState<number | null>(null);
  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (wholesalerId) {
      loadInvoices();
    }
  }, [wholesalerId, statusFilter, page]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Endpoint to get all invoices for wholesaler
      const response = await api.request<any>('/invoices/wholesaler', {
        params: {
          wholesalerId,
          status: statusFilter || undefined,
          page,
          size: PAGE_SIZE,
          sort: 'generatedAt,desc'
        }
      });
      
      setInvoices(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setError(err.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await invoiceService.downloadInvoice(invoice.orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  const handleResendEmail = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setResendingId(invoice.id);
    try {
      await invoiceService.resendInvoice(invoice.orderId);
      alert(`Invoice email resent to seller for order #${invoice.orderNumber}`);
    } catch (error: any) {
      alert(error.message || 'Failed to resend invoice email');
    } finally {
      setResendingId(null);
    }
  };

  const handleFilterChange = (filterValue: string) => {
    setPage(0);
    setStatusFilter(filterValue);
  };

  const pageNumber = page + 1;

  const filters = [
    { value: '', label: 'All' },
    { value: 'GENERATED', label: 'Generated' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PAID', label: 'Paid' },
    { value: 'OVERDUE', label: 'Overdue' },
  ];

  if (loading && invoices.length === 0) {
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
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all invoices from your sellers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Invoices</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{totalElements}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="mt-1 text-xl font-bold text-yellow-600">
            {invoices.filter(i => i.status === 'PENDING').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Paid</p>
          <p className="mt-1 text-xl font-bold text-green-600">
            {invoices.filter(i => i.status === 'PAID').length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Overdue</p>
          <p className="mt-1 text-xl font-bold text-red-600">
            {invoices.filter(i => i.status === 'OVERDUE').length}
          </p>
        </div>
      </div>

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
                  : filter.value === 'PAID'
                  ? 'bg-green-600 text-white'
                  : filter.value === 'OVERDUE'
                  ? 'bg-red-600 text-white'
                  : filter.value === 'GENERATED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No invoices found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {statusFilter ? 'No invoices match the selected filter' : 'Invoices will appear here once orders are delivered'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              onClick={() => navigate(`/wholesaler/invoices/${invoice.orderId}`)}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-slate-100 p-3">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{invoice.invoiceNumber}</h3>
                    <p className="text-sm text-slate-500">
                      Order: #{invoice.orderNumber} · ₹{invoice.totalAmount.toLocaleString()}
                    </p>
                    {/* <p className="text-xs text-slate-400 mt-1">
                      <Store className="inline h-3 w-3 mr-1" />
                      Seller ID: {invoice.sellerId}
                    </p> */}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <InvoiceStatusBadge status={invoice.status} />
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(invoice.generatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  Amount: ₹{invoice.totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={(e) => handleDownload(invoice, e)}
                  className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={(e) => handleResendEmail(invoice, e)}
                  disabled={resendingId === invoice.id}
                  className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  {resendingId === invoice.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Resend Email
                </button>
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
            <span className="font-semibold text-slate-900">{totalElements}</span> total invoices
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
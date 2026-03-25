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
  Grid3x3,
  Table
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { invoiceService } from '../../services/invoiceService';
import { InvoiceStatusBadge } from './component/InvoiceStatusBadge'; 
import { InvoiceFilters } from './component/InvoiceFilters';
import { Button } from '../../components/ui/button';
import { useDebounce } from '../../hooks/useDebounce';
import type { Invoice, InvoiceFilters as Filters, InvoiceStats } from '../../types/invoice';

const PAGE_SIZE = 10;

export function InvoicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sellerId = user?.id;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<Filters>({
    page: 0,
    size: PAGE_SIZE,
    sortBy: 'generatedAt',
    sortDir: 'desc',
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    minAmount: undefined,
    maxAmount: undefined,
  });

  const debouncedSearch = useDebounce(filters.search || '', 500);

  useEffect(() => {
    if (sellerId) {
      loadInvoices();
      loadStats();
    }
  }, [
    sellerId, 
    filters.page, 
    filters.size, 
    filters.sortBy, 
    filters.sortDir, 
    filters.status, 
    debouncedSearch, 
    filters.startDate, 
    filters.endDate, 
    filters.minAmount, 
    filters.maxAmount
  ]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      
      const response = await invoiceService.getSellerInvoices(
        sellerId!,
        filters.page,
        filters.size,
        `${filters.sortBy},${filters.sortDir}`,
        filters.status || undefined,
        debouncedSearch || undefined,
        filters.startDate || undefined,
        filters.endDate || undefined,
        filters.minAmount,
        filters.maxAmount
      );
      
      
      if (response && response.content) {
        setInvoices(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else {
        setInvoices([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err: any) {
      console.error('Error loading invoices:', err);
      setError(err.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await invoiceService.getInvoiceStats(sellerId!);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 0,
      size: PAGE_SIZE,
      sortBy: 'generatedAt',
      sortDir: 'desc',
      status: '',
      search: '',
      startDate: '',
      endDate: '',
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const pageNumber = filters.page + 1;

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Invoices</h1>
          <p className="mt-1 text-sm text-slate-500">
            View, filter, and download all your invoices
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-2 transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Grid View"
          >
            <Grid3x3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-md p-2 transition-colors ${
              viewMode === 'table' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Table View"
          >
            <Table className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Total Invoices</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Pending</p>
            <p className="mt-1 text-xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Paid</p>
            <p className="mt-1 text-xl font-bold text-green-600">{stats.paid}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Overdue</p>
            <p className="mt-1 text-xl font-bold text-red-600">{stats.overdue}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">Total Amount</p>
            <p className="mt-1 text-xl font-bold text-purple-600">₹{stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters Component */}
      <InvoiceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{invoices.length}</span> of{' '}
          <span className="font-medium text-slate-700">{totalElements}</span> invoices
        </p>
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No invoices found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {filters.status || filters.search || filters.startDate || filters.minAmount
              ? 'Try adjusting your filters'
              : 'Invoices will appear here once your orders are delivered'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              onClick={() => navigate(`/local-seller/invoices/${invoice.orderId}`)}
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

              <div className="mt-4 flex justify-end">
                <button
                  onClick={(e) => handleDownload(invoice, e)}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  onClick={() => navigate(`/local-seller/invoices/${invoice.orderId}`)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {invoice.orderNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {new Date(invoice.generatedAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                    ₹{invoice.totalAmount.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={(e) => handleDownload(invoice, e)}
                      className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 0}
              className="rounded-xl"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= totalPages - 1}
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
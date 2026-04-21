import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  IndianRupee,
  Truck,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import type { Invoice } from '../../types/invoice';
import { invoiceService } from '../../services/invoiceService';
import { useToast } from '../../context/ToastContext';

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

export function WholesalerInvoiceDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [orderId]);

  const loadInvoice = async () => {
    try {
      const data = await invoiceService.getInvoiceByOrderId(parseInt(orderId!));
      setInvoice(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!invoice) return;
    setResending(true);
    try {
      await invoiceService.resendInvoice(invoice.orderId);
      showToast(
        `Invoice email resent for order #${invoice.orderNumber}`,
        "success"
      );
    } catch (err: any) {
      showToast(
        err.message || "Failed to resend invoice email",
        "error"
      );
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error || 'Invoice not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/wholesaler/invoices')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Resend Email
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{invoice.invoiceNumber}</h2>
                <p className="text-sm text-slate-500">
                  Order: #{invoice.orderNumber}
                </p>
              </div>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Invoice Summary */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium text-slate-900">Invoice Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    Generated: {new Date(invoice.generatedAt).toLocaleString()}
                  </span>
                </div>
                {invoice.paidAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-slate-600">
                      Paid on: {new Date(invoice.paidAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-slate-900">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    Order: #{invoice.orderNumber}
                  </span>
                </div>
                {/* <div className="flex items-center gap-2 text-sm">
                  <Store className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    Seller ID: {invoice.sellerId}
                  </span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax (5%)</span>
                <span className="font-medium">₹{invoice.taxAmount.toLocaleString()}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -₹{invoice.discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 mt-2">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{invoice.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            This is a computer generated invoice. No signature required.
          </p>
        </div>
      </div>
    </div>
  );
}
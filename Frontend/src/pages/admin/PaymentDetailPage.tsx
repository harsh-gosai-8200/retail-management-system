import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  CreditCard,
  IndianRupee,
  Calendar,
  User,
  Store,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import { Button } from '../../components/ui/button';
import type { PaymentTransaction } from '../../types/payment';
import type { Order } from '../../types/order';

export function AdminPaymentDetailPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentTransaction | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [wholesalerInfo, setWholesalerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccess, setRefundSuccess] = useState<string | null>(null);
  const [checkingRefundStatus, setCheckingRefundStatus] = useState(false);

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPaymentDetails(parseInt(paymentId!));
      setPayment(data);
      setRefundAmount(data.amount);
      
      // Fetch order details
      if (data.orderId) {
        try {
          const orderData = await orderService.getOrderDetailsForAdmin(data.orderId);
          setOrder(orderData);

          if (orderData.sellerId) {
            const seller = await adminService.getUserDetails(orderData.sellerId);
            setSellerInfo(seller);
          }
          
          if (orderData.wholesalerId) {
            const wholesaler = await adminService.getUserDetails(orderData.wholesalerId);
            setWholesalerInfo(wholesaler);
          }
        } catch (err) {
          console.error('Failed to load order details:', err);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!payment || !payment.razorpayPaymentId) {
      setRefundError('Payment ID not found. Cannot process refund.');
      return;
    }

    if (refundAmount <= 0) {
      setRefundError('Refund amount must be greater than 0');
      return;
    }

    if (refundAmount > payment.amount) {
      setRefundError(`Refund amount cannot exceed original amount (₹${payment.amount.toLocaleString()})`);
      return;
    }

    setProcessingRefund(true);
    setRefundError(null);
    setRefundSuccess(null);

    try {
      const response = await paymentService.initiateRefund({
        paymentId: payment.razorpayPaymentId,
        amount: refundAmount,
        reason: refundReason || 'Refund processed by admin'
      });

      if (response.success) {
        setRefundSuccess(`Refund processed successfully! Refund ID: ${response.refundId}`);
        setShowRefundModal(false);
        // Reload payment details to show updated status
        setTimeout(() => {
          loadPayment();
        }, 2000);
      } else {
        setRefundError(response.message || 'Refund failed');
      }
    } catch (err: any) {
      console.error('Refund error:', err);
      setRefundError(err.message || 'Failed to process refund');
    } finally {
      setProcessingRefund(false);
    }
  };

  const handleCheckRefundStatus = async () => {
    if (!payment?.refundId) {
      setRefundError('No refund ID found for this transaction');
      return;
    }

    setCheckingRefundStatus(true);
    try {
      const response = await paymentService.getRefundStatus(payment.refundId);
      if (response.success) {
        alert(`Refund Status: ${response.status}\nAmount: ₹${response.amount?.toLocaleString()}\nMessage: ${response.message}`);
      } else {
        alert(`Failed to fetch refund status: ${response.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setCheckingRefundStatus(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'REFUNDED':
        return <Receipt className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const canRefund = () => {
    if (!payment) return false;
    const isOrderRejectedOrCancelled = order?.status === 'REJECTED' || order?.status === 'CANCELLED';
    return payment.status === 'SUCCESS' && !payment.isRefunded && isOrderRejectedOrCancelled;
  };

  const showRefundButton = payment && 
    payment.status === 'SUCCESS' && 
    !payment.isRefunded &&
    (order?.status === 'REJECTED' || order?.status === 'CANCELLED');

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error || 'Payment not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/payments')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </button>
        <Button
          onClick={() => loadPayment()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Payment Details Card */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Payment Details</h2>
              <p className="text-sm text-slate-500 mt-1">
                Transaction ID: {payment.razorpayPaymentId || payment.id}
              </p>
            </div>
            <AdminStatusBadge status={payment.status} type="payment" />
          </div>
        </div>

        <div className="p-6">
          {/* Refund Success/Error Messages */}
          {refundSuccess && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{refundSuccess}</span>
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-medium text-slate-900">Order Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Order Number:</span>
                  <span className="font-medium text-slate-900">{payment.orderNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Order ID:</span>
                  <span className="text-slate-600">{payment.orderId}</span>
                </div>
                {order && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-24">Order Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-slate-900">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Amount:</span>
                  <span className="text-xl font-bold text-blue-600">₹{payment.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Method:</span>
                  <span className="text-slate-600">{payment.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Date:</span>
                  <span className="text-slate-600">{new Date(payment.createdAt).toLocaleString()}</span>
                </div>
                {payment.paidAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-24">Paid At:</span>
                    <span className="text-slate-600">{new Date(payment.paidAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seller Information (Payer) */}
          {sellerInfo && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-3 font-medium text-blue-900 flex items-center gap-2">
                <Store className="h-5 w-5" />
                Payer Information (Local Seller)
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{sellerInfo.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>{sellerInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>{sellerInfo.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4 text-blue-600" />
                    <span>Shop: {sellerInfo.shopName || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wholesaler Information*/}
          {wholesalerInfo && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-3 font-medium text-green-900 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Receiver Information (Wholesaler)
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{wholesalerInfo.businessName || wholesalerInfo.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span>{wholesalerInfo.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span>{wholesalerInfo.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="mb-3 font-medium text-slate-900">Transaction Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-32">Razorpay Order ID:</span>
                <span className="text-slate-600 font-mono text-xs">{payment.razorpayOrderId || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-32">Razorpay Payment ID:</span>
                <span className="text-slate-600 font-mono text-xs">{payment.razorpayPaymentId || '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-32">Status:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  <span className="text-slate-600">{payment.status}</span>
                </div>
              </div>
              {payment.failureReason && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-32">Failure Reason:</span>
                  <span className="text-red-600">{payment.failureReason}</span>
                </div>
              )}
              {payment.isRefunded && (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-32">Refund ID:</span>
                    <span className="text-slate-600 font-mono text-xs">{payment.refundId || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-32">Refund Amount:</span>
                    <span className="text-slate-600">₹{payment.refundAmount?.toLocaleString()}</span>
                  </div>
                  {payment.refundId && (
                    <div className="mt-2">
                      <Button
                        onClick={handleCheckRefundStatus}
                        disabled={checkingRefundStatus}
                        variant="outline"
                        size="sm"
                        className="text-sm"
                      >
                        {checkingRefundStatus ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-3 w-3" />
                        )}
                        Check Refund Status
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Refund Button */}
          {showRefundButton && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowRefundModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Process Refund
              </Button>
            </div>
          )}

          {payment.status === 'SUCCESS' && !payment.isRefunded && order?.status !== 'REJECTED' && order?.status !== 'CANCELLED' && (
            <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700 border border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Refund is only available when the order is rejected or cancelled by the wholesaler.</span>
              </div>
            </div>
          )}

          {payment.status === 'REFUNDED' && (
            <div className="mt-6 rounded-lg bg-purple-50 p-4 text-sm text-purple-700 border border-purple-200">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span>This payment has been refunded. Refund ID: {payment.refundId}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Process Refund</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enter refund details below
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Original Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Original Amount
                </label>
                <div className="text-lg font-semibold text-slate-900">
                  ₹{payment.amount.toLocaleString()}
                </div>
              </div>

              {/* Refund Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Refund Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                    max={payment.amount}
                    min={0}
                    step={1}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Maximum refundable amount: ₹{payment.amount.toLocaleString()}
                </p>
              </div>

              {/* Refund Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason for Refund
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason for refund..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Error Message */}
              {refundError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <span>{refundError}</span>
                  </div>
                </div>
              )}

              {/* Warning for partial refunds */}
              {refundAmount < payment.amount && refundAmount > 0 && (
                <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>Partial refund of ₹{refundAmount.toLocaleString()} will be processed.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRefund}
                disabled={processingRefund || refundAmount <= 0 || refundAmount > payment.amount}
                className="bg-red-600 hover:bg-red-700"
              >
                {processingRefund ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 h-4 w-4" />
                    Confirm Refund
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
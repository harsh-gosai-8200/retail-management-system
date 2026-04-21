import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  Phone,
  User,
  Store,
  Loader2,
  AlertCircle,
  CheckCircle,
  Truck,
  CreditCard,
  IndianRupee,
  DollarSign,
  Clock,
  Building2,
  Mail
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { salesmanSelfService } from '../../services/salesmanSelfService';
import { OrderStatusBadge } from '../salesman/component/OrderStatusBadge'; 
import { OrderItemsTable } from '../salesman/component/OrderItemsTable';
import { Button } from '../../components/ui/button';
import type { SalesmanOrder } from '../../types/salesman';

export function SalesmanCollectionDetailPage() {
  const { salesmanId, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<SalesmanOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await salesmanSelfService.getOrderDetailsForAdmin(
      parseInt(orderId!), 
      parseInt(salesmanId!)
    );
      setOrder(data);
      
      if (data.sellerId) {
        try {
          const seller = await adminService.getUserDetails(data.sellerId);
          setSellerInfo(seller);
        } catch (err) {
          console.error('Failed to load seller info:', err);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusIcon = () => {
    if (!order) return null;
    
    const isCOD = order.paymentMethod === 'CASH';
    const isPaid = order.paymentStatus === 'PAID';
    
    if (isCOD) {
      return isPaid ? 
        <CheckCircle className="h-5 w-5 text-green-500" /> : 
        <Clock className="h-5 w-5 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPaymentStatusText = () => {
    if (!order) return '';
    
    const isCOD = order.paymentMethod === 'CASH';
    const isPaid = order.paymentStatus === 'PAID';
    
    if (isCOD) {
      return isPaid ? 'Cash Collected' : 'Pending Collection';
    } else {
      return 'Online Payment Completed';
    }
  };

  const getPaymentStatusColor = () => {
    if (!order) return '';
    
    const isCOD = order.paymentMethod === 'CASH';
    const isPaid = order.paymentStatus === 'PAID';
    
    if (isCOD) {
      return isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
    } else {
      return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error || 'Order not found'}</span>
        </div>
      </div>
    );
  }

  const isCOD = order.paymentMethod === 'CASH';
  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Collection Details</h1>
      </div>

      {/* Main Order Card */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Header with Status */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{order.orderNumber}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Delivered on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : new Date(order.orderDate).toLocaleString()}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="p-6">
          {/* Collection Summary Card */}
          <div className="mb-6 rounded-lg border p-4 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Collection Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{order.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Payment Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getPaymentStatusIcon()}
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getPaymentStatusColor()}`}>
                    {getPaymentStatusText()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-medium text-slate-900">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-28">Payment Method:</span>
                  <span className="font-medium text-slate-900">
                    {isCOD ? 'Cash on Delivery (COD)' : order.paymentMethod || 'Online Payment'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-28">Collection Status:</span>
                  <span className={isPaid ? 'text-green-600' : 'text-yellow-600'}>
                    {isPaid ? '✓ Collected' : '⏳ Pending'}
                  </span>
                </div>
                {isCOD && isPaid && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-28">Collected By:</span>
                    <span className="text-slate-600">Salesman</span>
                  </div>
                )}
                {!isCOD && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-28">Transaction ID:</span>
                    <span className="text-slate-600 font-mono text-xs">
                      {order.transactionId || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-slate-900">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-28">Total Items:</span>
                  <span className="text-slate-600">{order.itemCount} items</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-28">Subtotal:</span>
                  <span className="text-slate-600">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Information (Collection FROM) */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 font-medium text-blue-900 flex items-center gap-2">
              <Store className="h-5 w-5" />
              Collection From (Seller)
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{order.sellerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Store className="h-4 w-4 text-blue-600" />
                  <span>{order.sellerShop}</span>
                </div>
                {sellerInfo?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>{sellerInfo.email}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>{order.sellerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>{order.sellerAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="mb-3 font-medium text-green-900 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Information
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Delivery Address:</span>
                  <span className="text-slate-600">{order.deliveryAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Delivered On:</span>
                  <span className="text-slate-600">
                    {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'Not delivered'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Receiver Name:</span>
                  <span className="text-slate-600">{order.sellerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Receiver Phone:</span>
                  <span className="text-slate-600">{order.sellerPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <h3 className="mb-3 font-medium text-slate-900">Order Items</h3>
          {order.items && <OrderItemsTable items={order.items} totalAmount={order.totalAmount} />}

          {/* COD Collection Note */}
          {isCOD && !isPaid && (
            <div className="mt-6 rounded-lg bg-yellow-50 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  Payment pending. Cash not yet collected from the seller.
                </p>
              </div>
            </div>
          )}

          {isCOD && isPaid && (
            <div className="mt-6 rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700">
                  Cash collected successfully from the seller.
                </p>
              </div>
            </div>
          )}

          {!isCOD && (
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-700">
                  This was an online payment. No cash collection required.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
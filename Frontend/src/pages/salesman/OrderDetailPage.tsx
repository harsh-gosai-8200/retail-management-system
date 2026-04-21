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
  Clock
} from 'lucide-react';
import { salesmanSelfService } from '../../services/salesmanSelfService';
import { OrderStatusBadge } from './component/OrderStatusBadge'; 
import { OrderItemsTable } from './component/OrderItemsTable'; 
import type { SalesmanOrder } from '../../types/salesman';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<SalesmanOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await salesmanSelfService.getOrderDetails(parseInt(orderId!));
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          onClick={() => navigate('/salesman/orders')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Header with Status */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{order.orderNumber}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Placed on {new Date(order.orderDate).toLocaleString()}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-lg border p-4 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-slate-600" />
                <h3 className="font-medium text-slate-900">Payment Information</h3>
              </div>
              {isCOD ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  <IndianRupee className="h-3 w-3" />
                  Cash on Delivery
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  <CreditCard className="h-3 w-3" />
                  Online Payment
                </span>
              )}
            </div>
            
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Amount to Collect</p>
                <p className="text-lg font-bold text-slate-900">
                  ₹{order.totalAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Payment Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {isPaid ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Paid</span>
                    </>
                  ) : isCOD ? (
                    <>
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">Pending (Collect on Delivery)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Payment Pending</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Message for Salesman */}
            {order.status === 'SHIPPED' && isCOD && !isPaid && (
              <div className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  <span>This is a COD order. Remember to collect ₹{order.totalAmount.toLocaleString()} from the seller upon delivery.</span>
                </div>
              </div>
            )}

            {order.status === 'SHIPPED' && !isCOD && !isPaid && (
              <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>This order has been paid online. No cash collection required. Just deliver the items.</span>
                </div>
              </div>
            )}

            {order.status === 'DELIVERED' && isCOD && !isPaid && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Cash not yet collected! Please collect payment if not already done.</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Seller and Delivery Info */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-medium text-slate-900">Seller Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Store className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{order.sellerShop}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{order.sellerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{order.sellerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{order.sellerAddress}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-slate-900">Delivery Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{order.deliveryAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <h3 className="mb-3 font-medium text-slate-900">Order Items</h3>
          {order.items && <OrderItemsTable items={order.items} totalAmount={order.totalAmount} />}

          {/*Delivery Button - Only for SHIPPED orders */}
          {order.status === 'SHIPPED' && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate(`/salesman/orders/${order.orderId}/deliver`)}
                className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-3 text-base font-medium text-white shadow-md shadow-green-200 transition-all hover:bg-green-700 hover:scale-[1.02]"
              >
                <Truck className="h-5 w-5" />
                Proceed to Delivery
              </button>
            </div>
          )}

          {/* For PROCESSING orders - show info message */}
          {order.status === 'PROCESSING' && (
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-700">
                  This order is being processed. You will be able to deliver once it's marked as SHIPPED.
                </p>
              </div>
            </div>
          )}

          {/* For PENDING orders - show info message */}
          {order.status === 'PENDING' && (
            <div className="mt-6 rounded-lg bg-yellow-50 p-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  This order is pending approval. You will be able to deliver once it's approved and shipped.
                </p>
              </div>
            </div>
          )}

          {/* For DELIVERED orders - show success message */}
          {order.status === 'DELIVERED' && (
            <div className="mt-6 rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700">
                  This order has been delivered successfully.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
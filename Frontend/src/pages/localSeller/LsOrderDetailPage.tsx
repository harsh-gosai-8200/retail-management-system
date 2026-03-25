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
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/lsOrderService';
import { OrderStatusBadge } from './component/order/OrderStatusBadge'; 
import { OrderItemsTable } from './component/order/OrderItemsTable';
import { Button } from '../../components/ui/button';
import type { Order } from '../../types/lsorder';

export function LsOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const sellerId = user?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (sellerId && orderId) {
      loadOrder();
    }
  }, [orderId, sellerId]);

  const loadOrder = async () => {
    try {
      const data = await orderService.getOrderDetails(sellerId!, parseInt(orderId!));
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    const confirmCancel = window.confirm('Are you sure you want to cancel this order? This action cannot be undone.');
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      await orderService.cancelOrder(sellerId!, order.id);
      await loadOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
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

  const canCancel = order.status === 'PENDING';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/local-seller/orders')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
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
          <div className="mb-6 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="mb-3 font-medium text-slate-900">Wholesaler Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Store className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{order.wholesalerName}</span>
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
                {order.deliveryInstructions && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-slate-400">.</span>
                    <span className="text-slate-600 italic">{order.deliveryInstructions}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-slate-900">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{order.paymentMethod || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Status: {order.paymentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="mb-3 font-medium text-slate-900">Order Items</h3>
          {order.items && (
            <OrderItemsTable items={order.items} totalAmount={order.totalAmount} />
          )}

          {canCancel && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </Button>
            </div>
          )}

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

          {order.status === 'SHIPPED' && (
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-700">
                  Your order is on the way! It will be delivered soon.
                </p>
              </div>
            </div>
          )}

          {order.status === 'PENDING' && (
            <div className="mt-6 rounded-lg bg-yellow-50 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  Your order is pending approval. You will be notified once it's confirmed.
                </p>
              </div>
            </div>
          )}

          {order.status === 'CANCELLED' && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-gray-600" />
                <p className="text-sm text-gray-700">
                  This order has been cancelled.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
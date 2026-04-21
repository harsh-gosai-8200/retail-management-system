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
  Building2,
  Mail
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { OrderStatusBadge } from '../localSeller/component/order/OrderStatusBadge'; 
import { OrderItemsTable } from '../localSeller/component/order/OrderItemsTable';
import { Button } from '../../components/ui/button';
import type { Order } from '../../types/order';

export function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [wholesalerInfo, setWholesalerInfo] = useState<any>(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrderDetails(parseInt(orderId!));
      setOrder(data);
      
      if (data.sellerId) {
        const seller = await adminService.getUserDetails(data.sellerId);
        setSellerInfo(seller);
      }
      
      if (data.wholesalerId) {
        const wholesaler = await adminService.getUserDetails(data.wholesalerId);
        setWholesalerInfo(wholesaler);
      }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
        <Button
          onClick={() => loadOrderDetails()}
          variant="outline"
          className="flex items-center gap-2"
        >
          Refresh
        </Button>
      </div>

      {/* Order Details Card */}
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
          {/* Seller Information */}
          {sellerInfo && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-3 font-medium text-blue-900 flex items-center gap-2">
                <Store className="h-5 w-5" />
                Seller Information
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{order.sellerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4 text-blue-600" />
                    <span>{order.sellerShopName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>{sellerInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>{sellerInfo.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wholesaler Information */}
          {wholesalerInfo && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="mb-3 font-medium text-green-900 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Wholesaler Information
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{order.wholesalerName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span>{wholesalerInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span>{wholesalerInfo.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Information */}
          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h3 className="mb-3 font-medium text-purple-900 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Information
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span>{order.deliveryAddress}</span>
                </div>
                {/* {order.deliveryInstructions && (
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-purple-600"></span>
                    <span className="italic">{order.deliveryInstructions}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {order.deliveredAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span>Delivered: {new Date(order.deliveredAt).toLocaleString()}</span>
                  </div>
                )} */}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="mb-3 font-medium text-yellow-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Payment Method:</span>
                  <span>{order.paymentMethod || 'N/A'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-24">Payment Status:</span>
                  <span className={order.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                    {order.paymentStatus || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <h3 className="mb-3 font-medium text-slate-900">Order Items</h3>
          {order.items && <OrderItemsTable items={order.items} totalAmount={order.totalAmount} />}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  CreditCard,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { OrderStatusBadge } from './components/order/OrderStatusBadge'; 
import { StatusUpdateModal } from './components/order/StatusUpdateModal';
import type { Order } from '../../types/order';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    if (!id || !user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrder(user.id, parseInt(id));
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!order || !user?.id) return;
    
    if (!window.confirm('Are you sure you want to approve this order?')) return;
    
    setActionLoading(true);
    try {
      await orderService.approveOrder(user.id, order.id);
      await fetchOrder();
    } catch (err: any) {
      setError(err.message || 'Failed to approve order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!order || !user?.id) return;
    
    const reason = window.prompt('Please enter rejection reason:');
    if (!reason) return;
    
    setActionLoading(true);
    try {
      await orderService.rejectOrder(user.id, order.id, { 
        reason, 
        notifySeller: true 
      });
      await fetchOrder();
    } catch (err: any) {
      setError(err.message || 'Failed to reject order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (data: any) => {
    if (!order || !user?.id) return;
    
    setActionLoading(true);
    try {
      await orderService.updateStatus(user.id, order.id, data);
      setShowStatusModal(false);
      await fetchOrder();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {error || 'Order not found'}
      </div>
    );
  }

  const canApprove = order.status === 'PENDING';
  const canReject = order.status === 'PENDING';
  const canUpdateStatus = ['APPROVED', 'PROCESSING', 'SHIPPED'].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/wholesaler/orders')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        <div className="flex gap-2">
          {canApprove && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Order
            </button>
          )}
          
          {canReject && (
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Reject Order
            </button>
          )}

          {canUpdateStatus && (
            <button
              onClick={() => setShowStatusModal(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Truck className="h-4 w-4" />
              Update Status
            </button>
          )}
        </div>
      </div>

      {/* Order Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Placed on {formatDate(order.orderDate)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="p-6">
          {/* Customer & Delivery Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.sellerShopName}
                    </p>
                    <p className="text-sm text-gray-500">{order.sellerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {order.paymentStatus}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Last updated: {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-8">
            <h3 className="mb-4 font-medium text-gray-900">Order Items</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {item.productName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {item.productSku}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Subtotal
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(order.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      Tax
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(order.taxAmount)}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td colSpan={4} className="px-6 py-4 text-right text-base font-bold text-gray-900">
                      Total
                    </td>
                    <td className="px-6 py-4 text-right text-base font-bold text-blue-600">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        currentStatus={order.status}
      />
    </div>
  );
};
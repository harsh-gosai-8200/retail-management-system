// src/pages/salesman/DeliverOrderPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  User,
  Phone,
  MapPin,
  Store,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { salesmanSelfService } from '../../services/salesmanSelfService';
import { OrderStatusBadge } from './component/OrderStatusBadge';
import type { SalesmanOrder } from '../../types/salesman';

// Matches your DeliveryUpdateDTO
interface DeliveryFormData {
  status: 'DELIVERED' | 'PARTIALLY_DELIVERED' | 'FAILED' | 'RETURNED';
  notes?: string;
  receiverName?: string;
  receiverPhone?: string;
  deliveryPhoto?: string;
}

export function DeliverOrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<SalesmanOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state matching DeliveryFormData
  const [formData, setFormData] = useState<DeliveryFormData>({
    status: 'DELIVERED',
    notes: '',
    receiverName: '',
    receiverPhone: '',
    deliveryPhoto: '',
  });

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await salesmanSelfService.getOrderDetails(parseInt(orderId!));
      setOrder(data);
      
      // Pre-fill receiver info with seller details for DELIVERED
      setFormData(prev => ({
        ...prev,
        receiverName: data.sellerName,
        receiverPhone: data.sellerPhone,
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: DeliveryFormData['status']) => {
    setFormData({
      ...formData,
      status,
      ...(status !== 'DELIVERED' && {
        receiverName: '',
        receiverPhone: '',
        deliveryPhoto: '',
      }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      
      if (formData.status === 'DELIVERED') {
        // Use markAsDelivered for DELIVERED status
        response = await salesmanSelfService.markAsDelivered(parseInt(orderId!), {
          status: 'DELIVERED',
          notes: formData.notes,
          receiverName: formData.receiverName,
          receiverPhone: formData.receiverPhone,
          deliveryPhoto: formData.deliveryPhoto || undefined,
        });
      } else {
        // Use updateDeliveryStatus for other statuses
        response = await salesmanSelfService.updateDeliveryStatus(
          parseInt(orderId!),
          formData.status,
          formData.notes
        );
      }
      
      setSuccess(response.message || `Order marked as ${formData.status.replace('_', ' ')} successfully!`);
      
      // Redirect back to order details after 2 seconds
      setTimeout(() => {
        navigate(`/salesman/orders/${orderId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const isDelivered = formData.status === 'DELIVERED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/salesman/orders/${orderId}`)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Order
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Update Delivery</h1>
      </div>

      {/* Order Summary Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-slate-100 p-3">
              <Package className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{order.orderNumber}</h2>
              <p className="text-sm text-slate-500">
                <Store className="inline h-3 w-3 mr-1" />
                {order.sellerShop} · {order.itemCount} items · ₹{order.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Delivery Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-slate-900">Delivery Details</h3>
          
          <div className="space-y-4">
            {/* Delivery Status - Matches your backend enum */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Delivery Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => {
                  handleChange(e);
                  handleStatusChange(e.target.value as DeliveryFormData['status']);
                }}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="DELIVERED">Delivered Successfully</option>
                <option value="PARTIALLY_DELIVERED">Partially Delivered</option>
                <option value="FAILED">Delivery Failed</option>
                <option value="RETURNED">↩Returned</option>
              </select>
            </div>

            {/* Receiver Name - Only for DELIVERED (matches backend DTO) */}
            {isDelivered && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Receiver Name *
                  </label>
                  <input
                    type="text"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required={isDelivered}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Receiver Phone *
                  </label>
                  <input
                    type="text"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required={isDelivered}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Delivery Photo (Optional)
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      name="deliveryPhoto"
                      value={formData.deliveryPhoto}
                      onChange={handleChange}
                      placeholder="https://example.com/photo.jpg"
                      className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 bg-white p-2 hover:bg-slate-50"
                      title="Upload photo (coming soon)"
                    >
                      <Camera className="h-5 w-5 text-slate-600" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Notes - For all statuses */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Delivery Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder={
                  formData.status === 'DELIVERED' ? 'Add any delivery notes...' :
                  formData.status === 'PARTIALLY_DELIVERED' ? 'Which items were delivered? What is pending?' :
                  formData.status === 'FAILED' ? 'Why did delivery fail? (Shop closed, address not found, etc.)' :
                  'Reason for return?'
                }
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/salesman/orders/${orderId}`)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Update Delivery Status
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Store,
  MapPin,
  IndianRupee,
  CreditCard,
  Building2,
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/lsOrderService';
import { sellerService } from '../../services/sellerService';
import { Button } from '../../components/ui/button';
import type { CartSummary } from '../../types/cart';
import { paymentService } from '../../services/paymentService';

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const sellerId = user?.id;

  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [upiId, setUpiId] = useState('');
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Load cart on mount
  useEffect(() => {
    loadCart();
    loadProfile();
  }, []);

  // Pre-fill delivery address when profile loads
  useEffect(() => {
    if (profile?.address) {
      setDeliveryAddress(profile.address);
    }
  }, [profile]);

  const loadCart = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await cartService.getCart(sellerId!);
      setCart(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await sellerService.getProfile();
      setProfile(data);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    }
  };

  const initiateRazorpayPayment = async (order: any) => {
    try {
      const razorpayOrder = await paymentService.createOrder({
        orderId: order.id,
        amount: cart!.totalAmount,
      });

      const options = {
        key: razorpayOrder.razorpayKeyId,
        amount: razorpayOrder.amount * 100,
        currency: razorpayOrder.currency,
        name: 'Retail Management System',
        description: `Order #${razorpayOrder.orderNumber}`,
        order_id: razorpayOrder.razorpayOrderId,
        handler: async (response: any) => {
          const verification = await paymentService.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: razorpayOrder.orderId,
          });

          if (verification.success) {
            setSuccess(verification.message || 'Payment successful! Order confirmed.');
            setTimeout(() => {
              navigate(`/local-seller/orders/${razorpayOrder.orderId}`);
            }, 2000);
          } else {
            setError(verification.message || 'Payment verification failed');
            setSubmitting(false);
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError('Payment cancelled');
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (err: any) {
      throw new Error(err.message || 'Failed to initiate payment');
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const wholesalerId = cart.items[0]?.wholesalerId;
      const items = cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const orderData = {
        wholesalerId,
        sellerId: sellerId!,
        items,
        deliveryAddress: deliveryAddress.trim(),
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        paymentMethod,
        upiId: paymentMethod === 'UPI' ? upiId : undefined,
      };

      const response = await orderService.placeOrder(orderData);
      setPlacedOrder(response);

      if (paymentMethod === 'CASH') {
        setSuccess('Order placed successfully! You can pay on delivery.');
        setTimeout(() => {
          navigate(`/local-seller/orders/${response.id}`);
        }, 2000);
      } else if (paymentMethod === 'UPI') {
        await initiateRazorpayPayment(response);
      }

    } catch (err: any) {
      console.error('Order failed:', err);
      setError(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/local-seller/cart')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Your cart is empty</h3>
          <p className="mt-2 text-sm text-slate-500">
            Add items to your cart before checkout
          </p>
          <button
            onClick={() => navigate('/local-seller/wholesalers')}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Browse Wholesalers
          </button>
        </div>
      </div>
    );
  }

  const wholesalerName = cart.items[0]?.wholesalerName;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/local-seller/cart')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
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
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Summary */}
        <div className="md:col-span-2 space-y-6">
          {/* Wholesaler Info */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Store className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Order from {wholesalerName}</h2>
            </div>

            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-slate-900">₹{item.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Delivery Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  placeholder="Enter your complete delivery address"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                {profile?.address && (
                  <p className="mt-1 text-xs text-slate-400">
                    Pre-filled from your profile address
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={2}
                  placeholder="E.g., Call before delivery, Gate code, etc."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <Building2 className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900">Cash on Delivery</p>
                  <p className="text-xs text-slate-500">Pay when you receive the order</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <Smartphone className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900">UPI Payment</p>
                  <p className="text-xs text-slate-500">Google Pay, PhonePe, etc.</p>
                </div>
              </label>

              {/* {paymentMethod === 'UPI' && (
                <div className="ml-8 mt-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g., username@okhdfcbank)"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    You'll be redirected to Razorpay for payment
                  </p>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="md:col-span-1">
          <div className="sticky top-6 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">₹{cart.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax (5%)</span>
                <span className="text-slate-900">₹{cart.taxAmount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">₹{cart.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  paymentMethod === 'CASH' ? 'Place Order (Cash on Delivery)' : 'Pay & Place Order'
                )}
              </Button>
            </div>

            <p className="mt-4 text-xs text-center text-slate-500">
              By placing this order, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
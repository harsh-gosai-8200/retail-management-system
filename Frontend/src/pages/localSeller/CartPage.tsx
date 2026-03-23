import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Store,
  Package,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cartService } from "../../services/cartService";
import type { CartSummary } from "../../types/cart";

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sellerId = user?.id;

  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sellerId) loadCart();
  }, [sellerId]);

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

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating((prev) => ({ ...prev, [itemId]: true }));
    try {
      await cartService.updateQuantity(sellerId!, itemId, newQuantity);
      await loadCart();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdating((prev) => ({ ...prev, [itemId]: true }));
    try {
      await cartService.removeItem(sellerId!, itemId);
      await loadCart();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    setLoading(true);
    try {
      await cartService.clearCart(sellerId!);
      await loadCart();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate("/local-seller/checkout");
  };

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        {error}
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/local-seller/wholesalers")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Your cart is empty
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Add items from wholesalers to get started
          </p>

          <button
            onClick={() => navigate("/local-seller/wholesalers")}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Browse Wholesalers
          </button>
        </div>
      </div>
    );
  }

  // Group by wholesaler
  const itemsByWholesaler: Record<number, typeof cart.items> = {};
  cart.items.forEach((item) => {
    if (!itemsByWholesaler[item.wholesalerId]) {
      itemsByWholesaler[item.wholesalerId] = [];
    }
    itemsByWholesaler[item.wholesalerId].push(item);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/local-seller/wholesalers")}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {cart.totalItems} items
          </span>

          <button
            onClick={handleClearCart}
            className="text-sm text-red-600 hover:underline"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-6">
        {Object.entries(itemsByWholesaler).map(([id, items]) => (
          <div
            key={id}
            className="rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            {/* Wholesaler Header */}
            <div className="border-b bg-slate-50 px-6 py-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold">{items[0].wholesalerName}</h2>
            </div>

            {/* Items */}
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-6"
                >
                  {/* Image */}
                  <div className="h-20 w-20 rounded-lg bg-slate-100">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 m-auto text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productName}</h3>
                    <p className="text-sm text-slate-500">
                      ₹{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="p-1 border rounded"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1 border rounded"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Total */}
                  <div className="w-24 text-right">
                    ₹{item.total.toLocaleString()}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="font-semibold mb-4">Order Summary</h3>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{cart.subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span>₹{cart.taxAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{cart.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
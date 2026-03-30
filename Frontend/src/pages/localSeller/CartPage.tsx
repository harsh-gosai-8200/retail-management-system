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
  if (!sellerId) return null;

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

  const itemsByWholesaler = cart?.items.reduce((acc, item) => {
    if (!acc[item.wholesalerId]) {
      acc[item.wholesalerId] = [];
    }
    acc[item.wholesalerId].push(item);
    return acc;
  }, {} as Record<number, typeof cart.items>);

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    navigate("/local-seller/checkout", {
      state: { cart }
    });
  };

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

 

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <ShoppingCart className="h-12 w-12 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-800">
          Your cart is empty
        </h2>
        <p className="text-sm text-slate-500">
          Looks like you haven’t added anything yet.
        </p>

        <button
          onClick={() => navigate("/local-seller/wholesalers")}
          className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
       
  {
    error && (
      <div className="mb-4 flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        {error}
      </div>
    )
  }
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/local-seller/wholesalers")}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600 font-medium">
            {cart.totalItems} items
          </span>

          <button
            onClick={handleClearCart}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* LEFT: ITEMS */}
        <div className="md:col-span-2 space-y-6">
         {Object.entries(itemsByWholesaler || {}).map(([id, items]) => (
            <div
              key={id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              {/* WHOLESALER HEADER */}
              <div className="flex items-center gap-2 bg-slate-50 px-5 py-3 border-b">
                <Store className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800">
                  {items[0].wholesalerName}
                </h2>
              </div>

              {/* ITEMS */}
              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition"
                  >
                    {/* IMAGE */}
                    <div className="h-20 w-20 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-slate-400" />
                      )}
                    </div>

                    {/* INFO */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* TOTAL */}
                    <div className="w-24 text-right font-semibold text-slate-800">
                      ₹{item.total.toLocaleString()}
                    </div>

                    {/* REMOVE */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="md:col-span-1">
          <div className="sticky top-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="font-semibold text-slate-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">
                  ₹{cart.subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax (5%)</span>
                <span className="text-slate-900">
                  ₹{cart.taxAmount.toLocaleString()}
                </span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">
                    ₹{cart.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Button (MATCHED STYLE) */}
            <div className="mt-6">
              <button
                onClick={handleCheckout}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Proceed to Checkout
              </button>
            </div>

            <p className="mt-4 text-xs text-center text-slate-500">
              Review your items before placing the order
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type Product } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { cartService } from '../../../services/cartService';
import { Button } from "../../../components/ui/button";
import {
  CheckCircle2,
  Clock,
  Loader2,
  UserPlus,
  XCircle,
  ShoppingCart,
  Trash2,
} from "lucide-react";
type SubscriptionStatus =
  | "NONE"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "INACTIVE";

function hasValidImage(imageUrl: string | null | undefined) {
  const value = (imageUrl ?? "").trim();
  if (!value) return false;
  const lowered = value.toLowerCase();
  if (lowered === "null" || lowered === "undefined") return false;
  return true;
}

function stockBadgeClass(stock: number) {
  if (stock === 0) return "bg-red-50 text-red-700 ring-1 ring-red-200";
  if (stock < 10) return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
}

export function WholesalerProductViews() {
  const { id } = useParams();
  const wholesalerId = Number(id);
  const { user } = useAuth(); // user object from AuthContext
  const userId = user?.id;
  const sellerCity = user?.city;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [userApproved, setUserApproved] = useState<boolean | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);

  const checkUserApproval = useCallback(async () => {
    try {
      if (!userId || !wholesalerId) {
        setUserApproved(false);
        return;
      }
      const res = await api.getSubscriptionStatus(userId, wholesalerId);
      console.log("Subscription Status:", res);
      const status = (res.status || "NONE") as SubscriptionStatus;
      setSubscriptionStatus(status);
      setUserApproved(status === "APPROVED");
    } catch (err: unknown) {
      console.error("Subscription status error:", err);
      setSubscriptionStatus(null);
      setUserApproved(false);
    }
  }, [userId, wholesalerId]);

  const handleSubscribe = useCallback(async () => {
    if (!userId) return;
    try {
      await api.subscribeWholesaler(userId, wholesalerId);
    } catch (err: unknown) {
      console.error("Subscription error:", err);
    } finally {
      await checkUserApproval();
    }
  }, [userId, wholesalerId, checkUserApproval]);

  const handleUnsubscribe = useCallback(async () => {
    if (!userId) return;
    try {
      await api.unsubscribeWholesaler(userId, wholesalerId);
    } catch (err: unknown) {
      console.error("Unsubscribe error:", err);
    } finally {
      await checkUserApproval();
    }
  }, [userId, wholesalerId, checkUserApproval]);

  const handleCancel = useCallback(async () => {
    if (!userId) return;
    try {
      await api.cancelSubscription(userId, wholesalerId);
    } catch (err: unknown) {
      console.error("Cancel error:", err);
    } finally {
      await checkUserApproval();
    }
  }, [userId, wholesalerId, checkUserApproval]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const page = await api.getWholesalerProducts(wholesalerId, sellerCity);
      setProducts(page ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [wholesalerId]);

  useEffect(() => {
    if (!wholesalerId || !userId) return;

    loadProducts();
    checkUserApproval();
  }, [wholesalerId, userId, loadProducts, checkUserApproval]);
  const addToCart = async (product: Product) => {
    if (!userApproved) return;

    try {
      await cartService.addToCart(userId!, product.id!, 1);

      // update local cart state
      setCart((prev) => {
        if (prev.some((p) => p.id === product.id)) return prev;
        return [...prev, product];
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  function removeFromCart(product: Product) {
    if (!product) return; // do nothing if id is undefined
    setCart((prev) => prev.filter((p) => p.id !== product.id));
  }

  return (
  <div className="space-y-6">
    {/* HEADER */}
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Available Products
        </h1>
        <p className="text-sm text-slate-500">
          Browse available products from this wholesaler.
        </p>
      </div>

      <Button variant="outline" size="sm" className="rounded-lg">
        Cart ({cart.length})
      </Button>
    </header>

    {/* ERROR */}
    {error && (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
        {error}
      </div>
    )}

    {/* SUBSCRIPTION BAR */}
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
      
      {/* STATUS */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">
          Subscription:
        </span>

        {subscriptionStatus === "APPROVED" && (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Subscribed
          </span>
        )}

        {subscriptionStatus === "PENDING" && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        )}

        {(subscriptionStatus === "NONE" ||
          subscriptionStatus === "REJECTED" ||
          subscriptionStatus === "INACTIVE") && (
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <XCircle className="h-4 w-4" />
            Not Subscribed
          </span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-2">
        {subscriptionStatus === "APPROVED" && (
          <button
            onClick={handleUnsubscribe}
            className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition"
          >
            <XCircle className="h-4 w-4" />
            Unsubscribe
          </button>
        )}

        {subscriptionStatus === "PENDING" && (
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600 transition"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </button>
        )}

        {(subscriptionStatus === "NONE" ||
          subscriptionStatus === "REJECTED" ||
          subscriptionStatus === "INACTIVE") && (
          <button
            onClick={handleSubscribe}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 transition"
          >
            <UserPlus className="h-4 w-4" />
            Subscribe
          </button>
        )}
      </div>
    </div>

    {/* PRODUCTS GRID */}
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loading ? (
        <p className="col-span-3 text-center text-slate-500">
          Loading products...
        </p>
      ) : products.length === 0 ? (
        <p className="col-span-3 text-center text-slate-500">
          No products found.
        </p>
      ) : (
        products.map((product) => (
          <article
            key={product.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            {/* IMAGE */}
            <div className="mb-3 h-44 w-full overflow-hidden rounded-xl bg-slate-100">
              {hasValidImage(product.imageUrl) ? (
                <img
                  src={product.imageUrl as string}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <ShoppingCart className="h-10 w-10" />
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                {product.category || "Uncategorized"}
              </p>

              <h3 className="text-base font-semibold text-slate-900">
                {product.name}
              </h3>

              <p className="text-xs text-slate-500">
                SKU: {product.skuCode}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {(product.description ?? "No description available.").slice(
                  0,
                  110
                )}
                {(product.description?.length ?? 0) > 110 ? "..." : ""}
              </p>

              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockBadgeClass(
                  product.stockQuantity
                )}`}
              >
                {product.stockQuantity}{" "}
                {product.stockQuantity === 1 ? "unit" : "units"}
              </span>
            </div>

            {/* ACTION */}
            <div>
              {userApproved ? (
                cart.some((p) => p.id === product.id) ? (
                  <Button
                    onClick={() => removeFromCart(product)}
                    className="w-full flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove from Cart
                  </Button>
                ) : (
                  <Button
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                )
              ) : (
                <Button
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-500 cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Approval Required
                </Button>
              )}

              {!userApproved && (
                <p className="text-xs text-red-500 mt-1">
                  Add to cart available after approval
                </p>
              )}
            </div>
          </article>
        ))
      )}
    </section>
  </div>
);
}

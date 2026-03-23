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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [userApproved, setUserApproved] = useState<boolean | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);

  const checkUserApproval = useCallback(async () => {
    try {
      if (!userId) {
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

      const page = await api.getWholesalerProducts(wholesalerId);
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
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Available Products
        </h1>
        <p className="text-sm text-slate-500">
          Browse available products from this wholesaler.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Subscription</h2>
          {userApproved === null ? (
            <div className="mt-3 flex justify-center">
              <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {/* Status Badge */}
              {subscriptionStatus === "APPROVED" && (
                <button
                  disabled
                  className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50/20 px-3 py-1.5 text-sm text-green-600 cursor-not-allowed opacity-80 w-full justify-center"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Subscribed
                </button>
              )}

              {subscriptionStatus === "PENDING" && (
                <button
                  disabled
                  className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/20 px-3 py-1.5 text-sm text-amber-600 cursor-not-allowed opacity-80 w-full justify-center"
                >
                  <Clock className="h-4 w-4" />
                  Pending
                </button>
              )}

              {(subscriptionStatus === "NONE" ||
                subscriptionStatus === "REJECTED" ||
                subscriptionStatus === "INACTIVE") && (
                  <button
                    disabled
                    className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/30 px-3 py-1.5 text-sm text-blue-600 cursor-not-allowed opacity-80 w-full justify-center"
                  >
                    <XCircle className="h-4 w-4" />
                    Not Subscribed
                  </button>
                )}

              {/* Action Buttons */}
              {subscriptionStatus === "APPROVED" && (
                <button
                  onClick={handleUnsubscribe}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/20 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50/30 transition w-full justify-center"
                >
                  <XCircle className="h-4 w-4" />
                  Unsubscribe
                </button>
              )}

              {subscriptionStatus === "PENDING" && (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/20 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50/30 transition w-full justify-center"
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
                    className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/30 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50/50 transition w-full justify-center"
                  >
                    <UserPlus className="h-4 w-4" />
                    Subscribe Again
                  </button>
                )}
            </div>
          )}
        </aside>

        <div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" className="rounded-lg">
              Cart ({cart.length})
            </Button>
          </div>
        </div>
      </div>

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
          products.map((product) => {
            // const inCart = cart.find(p => p.id === product.id);
            return (
              <article
                key={product.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
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
                      110,
                    )}
                    {(product.description?.length ?? 0) > 110 ? "..." : ""}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockBadgeClass(product.stockQuantity)}`}
                  >
                    {product.stockQuantity}{" "}
                    {product.stockQuantity === 1 ? "unit" : "units"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {userApproved ? (
                    cart.some((p) => p.id === product.id) ? (
                      <Button
                        onClick={() => removeFromCart(product)}
                        className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg
                   bg-red-500 text-white hover:bg-red-500 shadow-sm
                 "
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove from Cart
                      </Button>
                    ) : (
                      <Button
                        onClick={() => addToCart(product)}
                        className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg
                 bg-blue-200 text-gray-400  shadow-sm
                 "
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    )
                  ) : (
                    <Button
                      className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg
               bg-blue/10 backdrop-blur-sm border border-white/20 text-gray-400
               cursor-not-allowed shadow-sm"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart (Approval Required)
                    </Button>
                  )}
                </div>

                {!userApproved && (
                  <p className="text-xs text-red-500 mt-1">
                    Add to cart available after approval
                  </p>
                )}
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

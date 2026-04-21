import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";
import { api, type Product } from "../../services/api";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";

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

export function LocalSellerProductsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const sellerCity = user?.city;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, true>>({});
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [subscriptionStatuses, setSubscriptionStatuses] = useState<
    Record<number, SubscriptionStatus>
  >({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const allProducts = await api.getAllProductsForSeller(sellerCity);
      setProducts(allProducts ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // Load subscription statuses for each wholesaler
  useEffect(() => {
    if (!userId || products.length === 0) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const uniqueWholesalers = new Set(
          products
          .map((p) => p.wholesalerId)
        .filter((id) => id != null));
        const statusMap: Record<number, SubscriptionStatus> = {};

        await Promise.all(
          Array.from(uniqueWholesalers).map(async (wId) => {
            if (!wId) return;
            try {
              const res = await api.getSubscriptionStatus(userId, wId);
              statusMap[wId] = res.status || "NONE";
            } catch {
              statusMap[wId] = "NONE";
            }
          }),
        );

        if (!cancelled) {
          setSubscriptionStatuses(statusMap);
        }
      } catch {
        // Ignore errors in subscription status loading
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, products]);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const product of products) {
      if (product.category) cats.add(product.category);
    }
    return Array.from(cats).sort();
  }, [products]);

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by category
      if (category !== "all" && product.category !== category) {
        return false;
      }

      // Filter by search query (name or SKU)
      if (searchQuery.length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = (product.name || "").toLowerCase().includes(query);
        const matchesSku = (product.skuCode || "")
          .toLowerCase()
          .includes(query);
        return matchesName || matchesSku;
      }

      return true;
    });
  }, [products, searchQuery, category]);

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setCategory("all");
  };

  const getSubscriptionStatus = (wholesalerId: number): SubscriptionStatus => {
    return subscriptionStatuses[wholesalerId] || "NONE";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="mx-auto mb-3 h-8 w-8 animate-pulse text-slate-400" />
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800">{error}</p>
        <Button onClick={loadProducts} className="mt-4" variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Package className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <p className="font-medium text-slate-900">No products available</p>
        <p className="text-sm text-slate-500">
          Products from wholesalers will appear here once you're subscribed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
        <p className="text-slate-600">
          Browse products from all your subscribed wholesalers
        </p>
      </div>

      {/* Filter Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name or SKU..."
                className="block h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-blue-500 focus:ring-blue-500/50"
              />
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-blue-500 focus:ring-blue-500/50 md:w-60"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="md"
            className="rounded-xl"
            onClick={handleResetFilters}
          >
            Reset
          </Button>
        </div>
      </section>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="font-medium text-slate-900">No products found</p>
          <p className="text-sm text-slate-500">Try adjusting your filters</p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const productKey = String(product.id ?? product.skuCode);
            const showImage =
              hasValidImage(product.imageUrl) && !brokenImages[productKey];

            return (
              <article
                key={productKey}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 h-44 w-full overflow-hidden rounded-xl bg-slate-100">
                  {showImage ? (
                    <img
                      src={product.imageUrl as string}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={() => {
                        setBrokenImages((prev) => ({
                          ...prev,
                          [productKey]: true,
                        }));
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-500">
                      <ShoppingBag className="h-10 w-10 text-slate-400" />
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide">
                        No Product Image
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {product.category}
                  </p>
                  <h3 className="text-base font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    SKU: {product.skuCode}
                  </p>
                  {product.wholesalerName && (
                    <p className="text-xs text-slate-500">
                      Wholesaler: {product.wholesalerName}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-600">
                    {(product.description || "No description available.").slice(
                      0,
                      110,
                    )}
                    {(product.description?.length ?? 0) > 110 ? "..." : ""}
                  </p>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <p className="text-lg font-bold text-slate-900">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockBadgeClass(product.stockQuantity)}`}
                  >
                    {product.stockQuantity}{" "}
                    {product.stockQuantity === 1 ? "unit" : "units"}
                  </span>
                </div>

                <p className="mb-2 text-xs font-medium text-slate-600">
                  Subscription status:{" "}
                  {getSubscriptionStatus(product.wholesalerId || 0)}
                </p>

                <div className="space-y-2">
                  <button
    onClick={() => navigate(`/local-seller/product/${product.id}`)}
    className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
  >
    View Details
  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

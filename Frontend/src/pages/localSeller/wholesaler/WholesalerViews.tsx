import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {api} from '../../../services/api';

export function WholesalerViews() {
  const { id } = useParams();
  const wholesalerId = Number(id);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wholesalerId) return;

    loadProducts();
  }, [wholesalerId]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);

      const page = await api.getProducts(wholesalerId, 0, 100);
      setProducts(page.content ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Wholesaler Products
        </h1>
        <p className="text-sm text-slate-500">
          Browse available products from this wholesaler.
        </p>
      </header>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No products available.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b last:border-none hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-900">
                    {product.name}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {product.category}
                  </td>

                  <td className="px-4 py-3 text-slate-900">
                    ₹{product.price.toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {product.stockQuantity}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
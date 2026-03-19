import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type Product } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { ShoppingCart, Trash2 } from 'lucide-react';

function stockBadgeClass(stock: number) {
  if (stock === 0) return 'bg-red-50 text-red-700 ring-1 ring-red-200';
  if (stock < 10) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
}

export function WholesalerProductViews() {



  const { id } = useParams();
  const wholesalerId = Number(id);
  const { user } = useAuth(); // user object from AuthContext
  const userId = user?.id ; 

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [userApproved, setUserApproved] = useState<boolean | null>(null);

  async function checkUserApproval() {
    try {
      if (!userId) return;
      const res = await api.getSubscriptionStatus(userId, wholesalerId);
       console.log("Subscription Status:", res);
      setUserApproved(res.status === "APPROVED");
    } catch {
      setUserApproved(false);
    }
  }

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);

      const page = await api.getWholesalerProducts(wholesalerId);
      setProducts(page ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!wholesalerId || !userId) return;

    loadProducts();
    checkUserApproval();

  }, [wholesalerId, userId]);


  function addToCart(product: Product) {
    if (cart.find(p => p.id === product.id)) return; // only once
    setCart(prev => [...prev, product]);
  }
  function removeFromCart(product: Product) {
    if (!product) return; // do nothing if id is undefined
    setCart((prev) => prev.filter((p) => p.id !== product.id));
  }

  return (

    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Available Products</h1>
        <p className="text-sm text-slate-500">Browse available products from this wholesaler.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" size="sm" className="rounded-lg">
          Cart ({cart.length})
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-3 text-center text-slate-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="col-span-3 text-center text-slate-500">No products found.</p>
        ) : (
          products.map(product => {
           // const inCart = cart.find(p => p.id === product.id);
            return (
              <article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-xs text-slate-500">SKU: {product.skuCode}</p>
                  <p className="text-xs text-slate-600">{(product.description ?? 'No description').slice(0, 100)}{(product.description?.length ?? 0) > 100 ? '...' : ''}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockBadgeClass(product.stockQuantity)}`}>
                    {product.stockQuantity} {product.stockQuantity === 1 ? 'unit' : 'units'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {userApproved ? (
                    cart.some(p => p.id === product.id) ? (
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
                  <p className="text-xs text-red-500 mt-1">Add to cart available after approval</p>
                )}
              </article>
            );
          })
        
        )}
      </section>
    </div>
      
  );

}




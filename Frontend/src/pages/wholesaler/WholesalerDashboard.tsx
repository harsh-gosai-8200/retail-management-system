import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Package,
  TrendingUp,
} from 'lucide-react'
import { api, type Product } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  inventoryValue: number
}

type Tone = 'blue' | 'amber' | 'red' | 'green'

const toneMap: Record<Tone, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

function stockBadgeClass(stock: number) {
  if (stock === 0) return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  if (stock < 10) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
}

function DashboardStatCard({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string
  value: ReactNode
  helper: string
  icon: ReactNode
  tone: Tone
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${toneMap[tone]}`}
        >
          {icon}
        </span>
      </div>
    </article>
  )
}

export function WholesalerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) {
      setProducts([])
      setIsLoading(false)
      setError('User session is missing a valid wholesaler ID. Please login again.')
      return
    }

    let cancelled = false
    const wholesalerId = user.id

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const page = await api.getProducts(wholesalerId, 0, 100)
        if (!cancelled) {
          setProducts(page.content ?? [])
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load dashboard data.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const stats: DashboardStats = useMemo(() => {
    const totalProducts = products.length
    const activeProducts = products.filter((p) => p.active).length
    const lowStockProducts = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity < 10,
    ).length
    const outOfStockProducts = products.filter((p) => p.stockQuantity === 0).length
    const inventoryValue = products.reduce(
      (sum, p) => sum + p.price * p.stockQuantity,
      0,
    )

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      inventoryValue,
    }
  }, [products])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Welcome back{user?.username ? `, ${user.username}` : ''}. Overview of your
            wholesale inventory.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          label="Total Products"
          value={stats.totalProducts}
          helper={`${stats.activeProducts} active in catalog`}
          icon={<Package className="h-5 w-5" />}
          tone="blue"
        />
        <DashboardStatCard
          label="Low Stock"
          value={stats.lowStockProducts}
          helper="Below 10 units remaining"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="amber"
        />
        <DashboardStatCard
          label="Out Of Stock"
          value={stats.outOfStockProducts}
          helper="Needs immediate restock"
          icon={<Clock3 className="h-5 w-5" />}
          tone="red"
        />
        <DashboardStatCard
          label="Inventory Value"
          value={`₹${stats.inventoryValue.toLocaleString('en-IN')}`}
          helper="Estimated on-hand stock value"
          icon={<TrendingUp className="h-5 w-5" />}
          tone="green"
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent products
            </h2>
            <p className="text-xs text-slate-400">
              Last few products in your catalog.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Stock</th>
                <th className="px-3 py-2 font-medium">State</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-slate-500"
                  >
                    Loading products…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-sm text-slate-500"
                  >
                    No products found. Add products in the Products page.
                  </td>
                </tr>
              ) : (
                products.slice(0, 5).map((product) => (
                  <tr
                    key={product.id ?? product.skuCode}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="px-3 py-2 text-slate-900">{product.name}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {product.category}
                    </td>
                    <td className="px-3 py-2 text-slate-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockBadgeClass(product.stockQuantity)}`}
                      >
                        {product.stockQuantity} units
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.active
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                        }`}
                      >
                        {product.active ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          'Inactive'
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

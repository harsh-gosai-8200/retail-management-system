import { useState } from 'react'
import { AlertTriangle, Boxes, CircleDollarSign, LayoutGrid, List, Package, Pencil, Search, ShoppingBag, Trash2 } from 'lucide-react'
import type { Product } from '../../../services/api'
import { Button } from '../../../components/ui/button'

export type ViewMode = 'grid' | 'table'

function hasValidImage(imageUrl: string | null | undefined) {
  const value = (imageUrl ?? '').trim()
  if (!value) return false
  const lowered = value.toLowerCase()
  if (lowered === 'null' || lowered === 'undefined') return false
  return true
}

function stockBadgeClass(stock: number) {
  if (stock === 0) return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  if (stock < 10) return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
}

function statusBadgeClass(active: boolean) {
  return active
    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

export function ProductStats({
  total,
  lowStock,
  outOfStock,
}: {
  total: number
  lowStock: number
  outOfStock: number
}) {
  const items = [
    { label: 'Results', value: total, subtext: 'Matching current filters', icon: <Boxes className="h-5 w-5" />, tone: 'from-blue-50 to-white border-blue-200' },
    { label: 'Low Stock', value: lowStock, subtext: 'Below 10 units', icon: <AlertTriangle className="h-5 w-5" />, tone: 'from-amber-50 to-white border-amber-200' },
    { label: 'Out Of Stock', value: outOfStock, subtext: 'Needs replenishment', icon: <CircleDollarSign className="h-5 w-5" />, tone: 'from-red-50 to-white border-red-200' },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.label} className={`rounded-2xl border bg-gradient-to-br ${item.tone} p-5 shadow-sm`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.subtext}</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-slate-700 shadow-sm ring-1 ring-slate-200">
              {item.icon}
            </span>
          </div>
        </article>
      ))}
    </section>
  )
}

export function ProductFilters({
  searchInput,
  onSearchChange,
  category,
  categories,
  onCategoryChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: {
  searchInput: string
  onSearchChange: (value: string) => void
  category: string
  categories: string[]
  onCategoryChange: (value: string) => void
  onResetFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (value: ViewMode) => void
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or SKU..."
            className="block h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 outline-none ring-1 ring-transparent transition focus:border-blue-500 focus:ring-blue-500/50"
          />
        </label>

        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
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

      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <Button
            type="button"
            variant={viewMode === 'grid' ? 'outline' : 'ghost'}
            size="sm"
            className="rounded-lg"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === 'table' ? 'outline' : 'ghost'}
            size="sm"
            className="rounded-lg"
            onClick={() => onViewModeChange('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button type="button" variant="ghost" size="md" className="rounded-xl" onClick={onResetFilters}>
          Reset
        </Button>
      </div>
    </section>
  )
}

export function ProductGrid({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  products: Product[]
  onEdit: (id?: number) => void
  onDelete: (product: Product) => void
  onToggleStatus: (product: Product) => void
}) {
  const [brokenImages, setBrokenImages] = useState<Record<string, true>>({})

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Package className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <p className="font-medium text-slate-900">No products found</p>
      </div>
    )
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const productKey = String(product.id ?? product.skuCode)
        const showImage = hasValidImage(product.imageUrl) && !brokenImages[productKey]

        return (
        <article key={productKey} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 h-44 w-full overflow-hidden rounded-xl bg-slate-100">
            {showImage ? (
              <img
                src={product.imageUrl as string}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={() => {
                  setBrokenImages((prev) => ({ ...prev, [productKey]: true }))
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

          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{product.category}</p>
              <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
              <p className="text-xs text-slate-500">SKU: {product.skuCode}</p>
              <p className="mt-1 text-xs text-slate-600">
                {(product.description || 'No description available.').slice(0, 110)}
                {(product.description?.length ?? 0) > 110 ? '...' : ''}
              </p>
            </div>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(product.active)}`}>
              {product.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-bold text-slate-900">₹{product.price.toLocaleString('en-IN')}</p>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockBadgeClass(product.stockQuantity)}`}>
              {product.stockQuantity} {product.stockQuantity === 1 ? 'unit' : 'units'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={() => onEdit(product.id)}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={() => onToggleStatus(product)}>
              {product.active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="rounded-lg text-red-600 hover:bg-red-50" onClick={() => onDelete(product)}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </article>
      )})}
    </section>
  )
}

export function ProductTable({
  products,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  products: Product[]
  isLoading: boolean
  onEdit: (id?: number) => void
  onDelete: (product: Product) => void
  onToggleStatus: (product: Product) => void
}) {
  return (
    <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2 font-medium">Product</th>
            <th className="px-3 py-2 font-medium">Category</th>
            <th className="px-3 py-2 font-medium">Price</th>
            <th className="px-3 py-2 font-medium">Stock</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                Loading products...
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-500">
                No products found
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id ?? product.skuCode} className="border-b border-slate-100 transition-colors hover:bg-slate-50/70 last:border-b-0">
                <td className="px-3 py-3 text-slate-900">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-slate-500">SKU: {product.skuCode}</p>
                </td>
                <td className="px-3 py-3 text-slate-700">{product.category}</td>
                <td className="px-3 py-3 font-medium text-slate-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stockBadgeClass(product.stockQuantity)}`}>
                    {product.stockQuantity} {product.stockQuantity === 1 ? 'unit' : 'units'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(product.active)}`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button type="button" size="sm" variant="outline" className="rounded-lg" onClick={() => onEdit(product.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="rounded-lg" onClick={() => onToggleStatus(product)}>
                      {product.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="rounded-lg text-red-600 hover:bg-red-50" onClick={() => onDelete(product)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )
}

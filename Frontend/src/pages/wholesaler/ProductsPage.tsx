import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { api, type Product, type SpringPage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/button'
import { DeleteProductModal, ProductFormModal, type ProductFormState } from './products/ProductModals'
import { ProductFilters, ProductGrid, ProductStats, ProductTable, type ViewMode } from './products/ProductViews'

const PAGE_SIZE = 12

const EMPTY_FORM: ProductFormState = {
  name: '',
  description: '',
  category: '',
  price: '',
  stockQuantity: '',
  unit: 'piece',
  skuCode: '',
  imageUrl: '',
}

function toFormState(product: Product): ProductFormState {
  return {
    name: product.name ?? '',
    description: product.description ?? '',
    category: product.category ?? '',
    price: String(product.price ?? ''),
    stockQuantity: String(product.stockQuantity ?? ''),
    unit: product.unit ?? 'piece',
    skuCode: product.skuCode ?? '',
    imageUrl: product.imageUrl ?? '',
  }
}

function toPayload(form: ProductFormState, wholesalerId: number): Partial<Product> {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    price: Number(form.price),
    stockQuantity: Number(form.stockQuantity),
    unit: form.unit.trim(),
    skuCode: form.skuCode.trim(),
    wholesalerId,
    imageUrl: form.imageUrl.trim() || null,
    active: true,
  }
}

export function ProductsPage() {
  const { user } = useAuth()
  const wholesalerId = user?.id ?? null

  const [productsPage, setProductsPage] = useState<SpringPage<Product> | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0)
      setSearchQuery(searchInput.trim())
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!wholesalerId) return
    let cancelled = false
    ;(async () => {
      try {
        const list = await api.getCategories(wholesalerId)
        if (!cancelled) setCategories(list)
      } catch {
        // optional data
      }
    })()
    return () => {
      cancelled = true
    }
  }, [wholesalerId])

  useEffect(() => {
    if (!wholesalerId) {
      setIsLoading(false)
      setProductsPage({ content: [], totalPages: 0, totalElements: 0, size: PAGE_SIZE, number: 0, empty: true })
      setError('User session is missing a valid wholesaler ID. Please login again.')
      return
    }

    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response =
          searchQuery.length > 0
            ? await api.searchProducts(wholesalerId, searchQuery, page, PAGE_SIZE)
            : category !== 'all'
              ? await api.getProductsByCategory(wholesalerId, category, page, PAGE_SIZE)
              : await api.getProducts(wholesalerId, page, PAGE_SIZE)

        if (!cancelled) setProductsPage(response)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load products.')
          setProductsPage({ content: [], totalPages: 0, totalElements: 0, size: PAGE_SIZE, number: 0, empty: true })
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [wholesalerId, page, searchQuery, category, reloadKey])

  const products = productsPage?.content ?? []
  const totalElements = productsPage?.totalElements ?? 0
  const totalPages = productsPage?.totalPages ?? 0
  const pageNumber = (productsPage?.number ?? 0) + 1

  const stats = useMemo(() => {
    let lowStock = 0
    let outOfStock = 0
    for (const p of products) {
      if (p.stockQuantity === 0) outOfStock += 1
      else if (p.stockQuantity < 10) lowStock += 1
    }
    return { lowStock, outOfStock }
  }, [products])

  const refreshList = () => setReloadKey((v) => v + 1)

  const openCreate = () => {
    setFormMode('create')
    setEditingId(null)
    setForm({
      ...EMPTY_FORM,
      skuCode: `SKU-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    })
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = async (id?: number) => {
    if (!id) return
    setFormError(null)
    setIsSaving(true)
    try {
      const product = await api.getProduct(id)
      setFormMode('edit')
      setEditingId(id)
      setForm(toFormState(product))
      setFormOpen(true)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load product details.')
    } finally {
      setIsSaving(false)
    }
  }

  const validateForm = (state: ProductFormState) => {
    if (!state.name.trim()) return 'Product name is required.'
    if (!state.category.trim()) return 'Category is required.'
    if (!state.skuCode.trim()) return 'SKU code is required.'
    if (!state.unit.trim()) return 'Unit is required.'
    if (!state.price || Number(state.price) < 0) return 'Price must be 0 or higher.'
    if (!state.stockQuantity || Number(state.stockQuantity) < 0) return 'Stock quantity must be 0 or higher.'
    return null
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!wholesalerId) {
      setFormError('Missing wholesaler ID. Please login again.')
      return
    }

    const validationMessage = validateForm(form)
    if (validationMessage) {
      setFormError(validationMessage)
      return
    }

    setIsSaving(true)
    setFormError(null)
    try {
      const payload = toPayload(form, wholesalerId)
      if (formMode === 'create') await api.createProduct(wholesalerId, payload)
      else if (editingId) await api.updateProduct(wholesalerId, editingId, payload)
      setFormOpen(false)
      refreshList()
    } catch (err: any) {
      setFormError(err?.message ?? 'Failed to save product.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget?.id) return
    setIsDeleting(true)
    try {
      await api.deleteProduct(deleteTarget.id)
      setDeleteTarget(null)
      refreshList()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete product.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async (product: Product) => {
    if (!product.id) return
    try {
      await api.toggleProductStatus(product.id, !product.active)
      refreshList()
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update product status.')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Product Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your catalog with table and card views.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => { setIsRefreshing(true); refreshList() }} size="md" className="rounded-xl">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreate} size="md" className="rounded-xl shadow-md shadow-blue-200">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <ProductStats total={totalElements} lowStock={stats.lowStock} outOfStock={stats.outOfStock} />

      <ProductFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        category={category}
        categories={categories}
        onCategoryChange={(value) => { setPage(0); setCategory(value) }}
        onResetFilters={() => {
          setPage(0)
          setCategory('all')
          setSearchInput('')
          setSearchQuery('')
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'grid' ? (
        <ProductGrid
          products={products}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <ProductTable
          products={products}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {totalPages > 0 && (
        <footer className="flex items-center justify-between text-xs text-slate-500">
          <p>
            Page <span className="font-semibold text-slate-900">{pageNumber}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              Previous
            </Button>
            <Button type="button" variant="outline" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              Next
            </Button>
          </div>
        </footer>
      )}

      <ProductFormModal
        open={formOpen}
        mode={formMode}
        form={form}
        categories={categories}
        error={formError}
        isSaving={isSaving}
        onClose={() => setFormOpen(false)}
        onChange={setForm}
        onSubmit={handleSave}
      />

      <DeleteProductModal
        product={deleteTarget}
        isDeleting={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

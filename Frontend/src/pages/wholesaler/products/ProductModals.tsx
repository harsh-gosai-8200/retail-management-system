import { AlertTriangle } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import type { Product } from '../../../services/api'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

export type ProductFormState = {
  name: string
  description: string
  category: string
  price: string
  stockQuantity: string
  unit: string
  skuCode: string
  imageUrl: string
}

export const UNIT_OPTIONS = ['piece', 'kg', 'gram', 'liter', 'ml', 'box', 'packet', 'carton', 'dozen']

export function ProductFormModal({
  open,
  mode,
  form,
  categories,
  error,
  isSaving,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  form: ProductFormState
  categories: string[]
  error: string | null
  isSaving: boolean
  onClose: () => void
  onChange: (next: ProductFormState) => void
  onSubmit: (event: FormEvent) => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'create' ? 'Create Product' : 'Edit Product'}
          </h2>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="mr-1 inline h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product Name">
              <Input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} placeholder="e.g. Premium Rice" />
            </Field>
            <Field label="SKU Code">
              <Input value={form.skuCode} onChange={(e) => onChange({ ...form, skuCode: e.target.value })} placeholder="SKU-00123" />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category">
              <Input list="categories-list" value={form.category} onChange={(e) => onChange({ ...form, category: e.target.value })} placeholder="e.g. Groceries" />
              <datalist id="categories-list">
                {categories.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </Field>
            <Field label="Unit">
              <select
                value={form.unit}
                onChange={(e) => onChange({ ...form, unit: e.target.value })}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus:border-blue-500 focus:ring-blue-500/50"
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Price">
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => onChange({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Stock Quantity">
              <Input type="number" min="0" value={form.stockQuantity} onChange={(e) => onChange({ ...form, stockQuantity: e.target.value })} />
            </Field>
          </div>

          <Field label="Image URL (Optional)">
            <Input value={form.imageUrl} onChange={(e) => onChange({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => onChange({ ...form, description: e.target.value })}
              rows={4}
              className="block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-transparent transition focus:border-blue-500 focus:ring-blue-500/50"
              placeholder="Product details..."
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function DeleteProductModal({
  product,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  product: Product | null
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Delete Product?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Delete <span className="font-medium text-slate-900">{product.name}</span> permanently?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  )
}

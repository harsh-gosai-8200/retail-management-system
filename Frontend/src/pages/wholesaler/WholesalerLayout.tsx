import { useState, type ComponentType } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  User,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  name: string
  href: string
  icon: ComponentType<{ className?: string }>
  available: boolean
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/wholesaler', icon: LayoutDashboard, available: true },
  { name: 'Products', href: '/wholesaler/products', icon: Package, available: true },
  { name: 'Orders', href: '/wholesaler/orders', icon: Package, available: false },
  { name: 'Payments', href: '/wholesaler/payments', icon: Package, available: false },
  { name: 'Invoices', href: '/wholesaler/invoices', icon: Package, available: false },
  { name: 'History', href: '/wholesaler/history', icon: Package, available: false },
]

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-2 px-4 py-6">
      {navigation.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/wholesaler' && pathname.startsWith(item.href))

        const className = `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
          item.available
            ? isActive
              ? 'bg-blue-50 text-blue-900'
              : 'text-slate-700 hover:bg-slate-100'
            : 'cursor-not-allowed text-slate-400'
        }`

        if (!item.available) {
          return (
            <div key={item.name} className={className}>
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
              <span className="ml-auto rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                Soon
              </span>
            </div>
          )
        }

        return (
          <Link
            key={item.name}
            to={item.href}
            className={className}
            onClick={onNavigate}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

export function WholesalerLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <h1 className="text-lg font-bold text-blue-900 sm:text-xl">
                Retail Management
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                {user?.username ? `${user.username} · ` : ''}Wholesaler Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
              aria-label="Logout"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden border-r border-slate-200 bg-white lg:block lg:w-64">
          <NavLinks pathname={location.pathname} />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu overlay"
            />
            <aside className="absolute inset-y-0 left-0 w-64 border-r border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="text-base font-semibold text-blue-900">Menu</h2>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavLinks
                pathname={location.pathname}
                onNavigate={() => setSidebarOpen(false)}
              />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

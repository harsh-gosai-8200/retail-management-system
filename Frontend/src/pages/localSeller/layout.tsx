import { useState, type ComponentType } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Store,
  User,
  X,
  ShoppingCart,
  CreditCard,
  FileText,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  available: boolean;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/local-seller/dashboard", icon: LayoutDashboard, available: true },
  { name: "Wholesalers", href: "/local-seller/wholesalers", icon: Store, available: true },
  { name: "Products", href: "/local-seller/products", icon: Package, available: true },
  { name: "Cart", href: "/local-seller/cart", icon: ShoppingCart, available: true },
  { name: "Orders", href: "/local-seller/orders", icon: Package, available: true },
  { name: "Invoices", href: "/local-seller/invoices", icon: FileText, available: true },
  { name: "Payments", href: "/local-seller/payments", icon: CreditCard, available: true },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1 px-3 py-5">
      {navigation.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/local-seller/dashboard" && pathname.startsWith(item.href));

        const base =
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all";

        const className = item.available
          ? isActive
            ? `${base} bg-blue-50 text-blue-900 shadow-sm`
            : `${base} text-slate-700 hover:bg-slate-100`
          : `${base} cursor-not-allowed text-slate-400`;

        if (!item.available) {
          return (
            <div key={item.name} className={className}>
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
              <span className="ml-auto rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                Soon
              </span>
            </div>
          );
        }

        return (
          <Link key={item.name} to={item.href} className={className} onClick={onNavigate}>
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export function LocalSellerLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div>
              <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Retail Management
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                {user?.username ? `${user.username} · ` : ""}
                Local Seller Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
            onClick={() => navigate("/local-seller/profile")}>
              
              <User className="h-5 w-5" />
            </button>

            <button
              onClick={logout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block lg:w-60 border-r border-slate-200 bg-white">
          <NavLinks pathname={location.pathname} />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />

            <aside className="absolute inset-y-0 left-0 w-60 border-r border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h2 className="text-base font-semibold text-slate-900">Menu</h2>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <NavLinks pathname={location.pathname} onNavigate={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
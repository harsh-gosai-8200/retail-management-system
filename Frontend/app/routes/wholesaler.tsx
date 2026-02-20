import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  FileText,
  History,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { useAuth } from "~/context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    href: "/wholesaler",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/wholesaler/products",
    icon: Package,
  },
  {
    name: "Orders",
    href: "/wholesaler/orders",
    icon: ShoppingCart,
  },
  {
    name: "Payments",
    href: "/wholesaler/payments",
    icon: CreditCard,
  },
  {
    name: "Invoices",
    href: "/wholesaler/invoices",
    icon: FileText,
  },
  {
    name: "History",
    href: "/wholesaler/history",
    icon: History,
  },
];

export default function WholesalerLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {logout} = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <div>
              <h1 className="text-xl font-bold text-blue-900">
                Prime Wholesale Distributors
              </h1>
              <p className="text-sm text-slate-600">Wholesaler Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => logout()}>
              <LogOut className="h-5 w-5 text-red-600" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:shrink-0">
          <div className="flex flex-col w-64 border-r border-slate-200 bg-white">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/wholesaler" &&
                    location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-900"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-blue-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== "/wholesaler" &&
                      location.pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-50 text-blue-900"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

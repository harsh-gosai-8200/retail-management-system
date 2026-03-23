import { Link } from "react-router-dom"
import { Package, TrendingUp, ShieldCheck } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-blue-900">
            Retail Management
          </h1>
          <div className="flex gap-3">
            <Link
              to="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              to="/auth/register"
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Streamline Your Wholesale Business
        </h2>
        <p className="mt-6 text-lg text-slate-600">
          Manage products, track inventory, and monitor performance
          with a powerful retail management system built for wholesalers.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/auth/register"
            className="rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-800"
          >
            Get Started
          </Link>
          <Link
            to="/auth/login"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Login to Dashboard
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h3 className="text-center text-2xl font-semibold">
            Powerful Features for Your Business
          </h3>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <Package className="h-8 w-8 text-blue-900" />
              <h4 className="mt-4 text-lg font-semibold">
                Product Management
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                Add, update, and manage your inventory efficiently with
                real-time stock tracking.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <TrendingUp className="h-8 w-8 text-blue-900" />
              <h4 className="mt-4 text-lg font-semibold">
                Business Insights
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                Monitor inventory value and product performance
                with dashboard analytics.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-blue-900" />
              <h4 className="mt-4 text-lg font-semibold">
                Secure Access
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                Role-based authentication ensures your data
                remains protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <h3 className="text-2xl font-semibold">
          Ready to Modernize Your Wholesale Operations?
        </h3>
        <p className="mt-3 text-sm text-slate-600">
          Join today and take control of your inventory management.
        </p>
        <Link
          to="/auth/register"
          className="mt-6 inline-block rounded-xl bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-800"
        >
          Create Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Retail Management System. All rights reserved.
      </footer>
    </div>
  )
}
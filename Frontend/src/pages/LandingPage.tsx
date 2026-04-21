import { Link } from "react-router-dom"
import { 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  Store, 
  Users, 
  BarChart3, 
  Smartphone, 
  CreditCard,
  Truck,
  LineChart,
  CheckCircle2,
  ArrowRight,
  Star,
  Building2,
  ClipboardList,
  IndianRupee,
  Clock
} from "lucide-react"

const DashboardMockup = () => (
  <div className="rounded-xl bg-white p-4 shadow-xl">
    <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
        <div className="h-3 w-24 rounded bg-slate-300"></div>
      </div>
      <div className="h-8 w-8 rounded-full bg-slate-200"></div>
    </div>
    <div className="mb-4 grid grid-cols-3 gap-3">
      <div className="rounded-lg bg-blue-50 p-3">
        <div className="h-2 w-12 rounded bg-blue-200 mb-2"></div>
        <div className="h-4 w-16 rounded bg-blue-600"></div>
      </div>
      <div className="rounded-lg bg-green-50 p-3">
        <div className="h-2 w-12 rounded bg-green-200 mb-2"></div>
        <div className="h-4 w-16 rounded bg-green-600"></div>
      </div>
      <div className="rounded-lg bg-purple-50 p-3">
        <div className="h-2 w-12 rounded bg-purple-200 mb-2"></div>
        <div className="h-4 w-16 rounded bg-purple-600"></div>
      </div>
    </div>
    <div className="space-y-2">
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200"></div>
            <div>
              <div className="h-3 w-24 rounded bg-slate-300 mb-1"></div>
              <div className="h-2 w-16 rounded bg-slate-200"></div>
            </div>
          </div>
          <div className="h-6 w-16 rounded bg-slate-200"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Shop<span className="text-blue-600">Nest</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              to="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              to="/auth/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-100/20 blur-3xl" />
        
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                </span>
                The Future of Retail Supply Chain
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Streamline Your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Retail Supply Chain
                </span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Eliminate pen-paper chaos and WhatsApp confusion. A unified platform for 
                Wholesalers, Local Sellers, and Salesmen to manage orders, track collections, 
                and grow revenue seamlessly.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-xl"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Watch Demo
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-slate-600">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-slate-600">14-day free trial</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-1 shadow-2xl">
                <div className="rounded-xl bg-white p-4">
                  {/* <img
                    src="https://placehold.co/600x400/e2e8f0/475569?text=Dashboard+Preview"
                    alt="Dashboard Preview"
                    className="rounded-lg"
                  /> */}
                  <DashboardMockup />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-lg bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Revenue Growth</p>
                    <p className="text-lg font-bold text-slate-900">+156%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              The Problem We're Solving
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Retail supply chains are broken. Manual processes are costing you time, money, and growth.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-red-100 p-3">
                <ClipboardList className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Pen & Paper Chaos</h3>
              <p className="mt-2 text-sm text-slate-600">
                Lost orders, missed collections, and manual errors costing thousands in revenue.
              </p>
            </div>
            <div className="rounded-xl border border-yellow-100 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-yellow-100 p-3">
                <Smartphone className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">WhatsApp Confusion</h3>
              <p className="mt-2 text-sm text-slate-600">
                Orders scattered across WhatsApp, missed messages, and no centralized tracking.
              </p>
            </div>
            <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No Data Insights</h3>
              <p className="mt-2 text-sm text-slate-600">
                No visibility into sales performance, top products, or revenue analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section - For Wholesalers */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                For Wholesalers
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Take complete control of your distribution network and scale your business.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  "Real-time inventory management across all products",
                  "Track salesmen performance and collections",
                  "Monitor local seller subscriptions and orders",
                  "Automated invoice generation and payment tracking",
                  "Detailed analytics on top-selling products and regions"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth/register?role=WHOLESALER"
                className="mt-8 inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 p-6">
              <img
                src="https://placehold.co/500x400/e2e8f0/475569?text=Wholesaler+Dashboard"
                alt="Wholesaler Dashboard"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* For Local Sellers */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-slate-50 p-6">
                <img
                  src="https://placehold.co/500x400/e2e8f0/475569?text=Local+Seller+App"
                  alt="Local Seller Dashboard"
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex rounded-lg bg-green-100 p-3">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                For Local Sellers
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Order from multiple wholesalers, track deliveries, and manage payments effortlessly.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  "Browse products from subscribed wholesalers",
                  "Place orders with Cash on Delivery or UPI",
                  "Real-time order tracking and delivery updates",
                  "View complete payment history and invoices",
                  "Easy reordering from favorite products"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth/register?role=LOCAL_SELLER"
                className="mt-8 inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all"
              >
                Start Ordering
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Salesmen */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-4 inline-flex rounded-lg bg-orange-100 p-3">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                For Salesmen
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Manage deliveries, collect payments, and track commissions on the go.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  "View assigned local sellers and delivery routes",
                  "Update order status in real-time",
                  "Collect cash payments and mark as collected",
                  "Track daily collections and pending payments",
                  "Performance analytics and commission tracking"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/auth/login"
                className="mt-8 inline-flex items-center gap-2 text-orange-600 font-semibold hover:gap-3 transition-all"
              >
                Join as Salesman
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-slate-50 p-6">
              <img
                src="https://placehold.co/500x400/e2e8f0/475569?text=Salesman+Mobile+App"
                alt="Salesman App"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Why Choose RetailFlow?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Everything you need to modernize your retail supply chain
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="inline-flex rounded-full bg-blue-100 p-4">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Revenue Growth</h3>
              <p className="mt-2 text-sm text-slate-600">
                Increase sales by 40% with better order management
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex rounded-full bg-green-100 p-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Save Time</h3>
              <p className="mt-2 text-sm text-slate-600">
                Reduce manual work by 70% with automation
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex rounded-full bg-purple-100 p-4">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Secure</h3>
              <p className="mt-2 text-sm text-slate-600">
                Role-based access with encrypted data
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex rounded-full bg-orange-100 p-4">
                <LineChart className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Analytics</h3>
              <p className="mt-2 text-sm text-slate-600">
                Real-time insights and performance tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Trusted by Businesses
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              See what our customers are saying
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Rajesh Sharma",
                role: "Wholesaler, Delhi",
                content: "RetailFlow transformed our business. No more WhatsApp chaos - everything is organized and trackable.",
                rating: 5
              },
              {
                name: "Priya Patel",
                role: "Local Seller, Mumbai",
                content: "Ordering from multiple wholesalers has never been easier. The payment tracking is a lifesaver.",
                rating: 5
              },
              {
                name: "Amit Kumar",
                role: "Salesman, Bangalore",
                content: "The mobile app makes delivery management so simple. I can track all my collections in one place.",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-600">"{testimonial.content}"</p>
                <div className="mt-4">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Your Business?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Join thousands of businesses already using RetailFlow to streamline their operations
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 transition-all hover:bg-slate-100"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            Free for 14 days. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-slate-900">RetailFlow</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Modernizing retail supply chains across India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li><Link to="#" className="hover:text-blue-600">Features</Link></li>
                <li><Link to="#" className="hover:text-blue-600">Pricing</Link></li>
                <li><Link to="#" className="hover:text-blue-600">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li><Link to="#" className="hover:text-blue-600">About</Link></li>
                <li><Link to="#" className="hover:text-blue-600">Blog</Link></li>
                <li><Link to="#" className="hover:text-blue-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                <li><Link to="#" className="hover:text-blue-600">Privacy</Link></li>
                <li><Link to="#" className="hover:text-blue-600">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} RetailFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
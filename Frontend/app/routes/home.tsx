import { Link } from "react-router";
// import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Store, Package, TrendingUp, ShoppingCart } from "lucide-react";

export function meta({ }: any /* Route.MetaArgs */) {
  return [
    { title: "Retail Management System" },
    {
      name: "description",
      content: "Comprehensive retail and wholesale management platform",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-900">
                Retail Management
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Welcome to Retail Management System
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A comprehensive platform for managing wholesale and retail
            operations, inventory, orders, payments, and more.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Package className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage inventory, pricing, and stock levels
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <ShoppingCart className="h-10 w-10 text-emerald-600 mb-2" />
              <CardTitle>Order Processing</CardTitle>
              <CardDescription>
                Handle orders from placement to delivery
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-amber-600 mb-2" />
              <CardTitle>Payment Tracking</CardTitle>
              <CardDescription>
                Monitor payments and financial transactions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Store className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Invoice Generation</CardTitle>
              <CardDescription>
                Create and manage professional invoices
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl shadow-xl p-12 text-center max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Get Started with Your Dashboard
          </h3>
          <p className="text-lg text-slate-600 mb-8">
            Access your wholesaler dashboard to manage products, process orders,
            track payments, and generate invoices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/wholesaler">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
              >
                <Store className="mr-2 h-5 w-5" />
                Wholesaler Dashboard
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-slate-200">
            <div>
              <p className="text-3xl font-bold text-blue-600">120+</p>
              <p className="text-sm text-slate-600 mt-1">Products Available</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">500+</p>
              <p className="text-sm text-slate-600 mt-1">Orders Processed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">99%</p>
              <p className="text-sm text-slate-600 mt-1">
                Customer Satisfaction
              </p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Key Features
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-lg text-slate-900 mb-2">
                Complete Product Catalog
              </h4>
              <p className="text-slate-600">
                Add, edit, and manage your entire product inventory with ease
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-lg text-slate-900 mb-2">
                Order Approval System
              </h4>
              <p className="text-slate-600">
                Review, approve, reject, or modify incoming orders
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-lg text-slate-900 mb-2">
                Payment Management
              </h4>
              <p className="text-slate-600">
                Track payments with multiple payment modes support
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-lg text-slate-900 mb-2">
                Professional Invoices
              </h4>
              <p className="text-slate-600">
                Generate detailed invoices with GST calculations
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-lg text-slate-900 mb-2">
                Complete Order History
              </h4>
              <p className="text-slate-600">
                Access full transaction history with advanced filters
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-lg text-slate-900 mb-2">
                Real-time Analytics
              </h4>
              <p className="text-slate-600">
                View business insights and performance metrics
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600">
          <p>© 2024 Retail Management System. All rights reserved.</p>
        </div>
      </footer>
    </div >
  );
}

// import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
// import { useAuth } from './context/AuthContext.tsx'
// import { LoginPage } from './pages/auth/LoginPage.tsx'
// import { RegisterPage } from './pages/auth/RegisterPage.tsx'
// import { WholesalerLayout } from './pages/wholesaler/WholesalerLayout.tsx'
// import { WholesalerDashboard } from './pages/wholesaler/WholesalerDashboard.tsx'
// import { ProductsPage } from './pages/wholesaler/ProductsPage.tsx'
// import { OrderDetailPage } from './pages/wholesaler/OrderDetailPage.tsx'
// import { OrdersPage } from './pages/wholesaler/OrdersPage.tsx'
// import { SalesmenPage } from './pages/wholesaler/SalesmenPage.tsx'
// import { SalesmanDetailsPage } from './pages/wholesaler/SalesmanDetailsPage.tsx'
// import { CreateSalesmanPage } from './pages/wholesaler/CreateSalesmanPage.tsx'
// import { AssignSellersPage } from './pages/wholesaler/AssignSellersPage.tsx'
// import { AssignmentsPage } from './pages/wholesaler/AssignmentsPage.tsx'
// import { EditSalesmanPage } from './pages/wholesaler/EditSalesmanPage.tsx'
// import { SalesmanLayout } from './pages/salesman/SalesmanLayout.tsx'
// import { SalesmanDashboard } from './pages/salesman/SalesmanDashboard.tsx'
// import { AssignedSellersPage } from './pages/salesman/AssignedSellersPage.tsx'
// import { SellerOrdersPage } from './pages/salesman/SellerOrdersPage.tsx'

// function ProtectedRoute() {
//   const { isAuthenticated, isLoading } = useAuth()
//   const location = useLocation()

//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-white">
//         <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" aria-label="Loading" />
//       </div>
//     )
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/auth/login" state={{ from: location }} replace />
//   }

//   return <Outlet />
// }

// function App() {
//   return (
//     <Routes>
//       <Route path="/auth/login" element={<LoginPage />} />
//       <Route path="/auth/register" element={<RegisterPage />} />

//       <Route element={<ProtectedRoute />}>
//         <Route path="/wholesaler" element={<WholesalerLayout />}>
//           <Route index element={<WholesalerDashboard />} />
//           <Route path="products" element={<ProductsPage />} />
//           <Route path="orders" element={<OrdersPage />} />
//           <Route path="orders/:id" element={<OrderDetailPage />} />
//           <Route path="salesmen" element={<SalesmenPage />} />
//           <Route path="salesmen/create" element={<CreateSalesmanPage />} />
//           <Route path="salesmen/:id" element={<SalesmanDetailsPage />} />
//           <Route path="salesmen/:id/edit" element={<EditSalesmanPage />} />
//           <Route path="salesmen/:id/assign" element={<AssignSellersPage />} />
//           <Route path="assignments" element={<AssignmentsPage />} />
//         </Route>
//         <Route path="/salesman" element={<SalesmanLayout />}>
//           <Route index element={<SalesmanDashboard />} />
//           <Route path="assigned-sellers" element={<AssignedSellersPage />} />
//           <Route path="sellers/:sellerId/orders" element={<SellerOrdersPage />} />
//           <Route path="orders" element={<SellerOrdersPage />} /> 
//           <Route path="orders/:orderId" element={<OrderDetailPage />} />
//         </Route>
//       </Route>

//       <Route path="*" element={<Navigate to="/wholesaler" replace />} />
//     </Routes>
//   )
// }

// export default App



import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.tsx'
import { RoleBasedRoute } from './components/RoleBasedRoute.tsx'
import { LoginPage } from './pages/auth/LoginPage.tsx'
import { RegisterPage } from './pages/auth/RegisterPage.tsx'
import { WholesalerLayout } from './pages/wholesaler/WholesalerLayout.tsx'
import { WholesalerDashboard } from './pages/wholesaler/WholesalerDashboard.tsx'
import { ProductsPage } from './pages/wholesaler/ProductsPage.tsx'
import LandingPage from "./pages/LandingPage";
import { LocalSellerLayout } from "./pages/localSeller/layout.tsx";
//import { WholesalersPage } from "./pages/localSeller/WholesalersPage";
import { LocalSellerDashboard } from "./pages/localSeller/LocalSellerDashboard.tsx";
import { WholesalersPage } from './pages/localSeller/WholesalersPage.tsx'
import { WholesalerProductViews } from './pages/localSeller/wholesaler/WholesalerProductViews.tsx'
import { OrderDetailPage } from './pages/wholesaler/OrderDetailPage.tsx'
import { OrdersPage } from './pages/wholesaler/OrdersPage.tsx'
import { SalesmenPage } from './pages/wholesaler/SalesmenPage.tsx'
import { SalesmanDetailsPage } from './pages/wholesaler/SalesmanDetailsPage.tsx'
import { CreateSalesmanPage } from './pages/wholesaler/CreateSalesmanPage.tsx'
import { AssignSellersPage } from './pages/wholesaler/AssignSellersPage.tsx'
import { AssignmentsPage } from './pages/wholesaler/AssignmentsPage.tsx'
import { EditSalesmanPage } from './pages/wholesaler/EditSalesmanPage.tsx'
import { SalesmanLayout } from './pages/salesman/SalesmanLayout.tsx'
import { SalesmanDashboard } from './pages/salesman/SalesmanDashboard.tsx'
import { AssignedSellersPage } from './pages/salesman/AssignedSellersPage.tsx'
import { SellerOrdersPage } from './pages/salesman/SellerOrdersPage.tsx'
import { OrderDetailPage as SalesmanOrderDetailPage } from './pages/salesman/OrderDetailPage.tsx'
import { AllOrdersPage } from './pages/salesman/AllOrdersPage.tsx'
import { DeliverOrderPage } from './pages/salesman/DeliverOrderPage.tsx'
import { WholesalerSubscriptionRequests } from './pages/wholesaler/WholesalerSubscriptionRequests.tsx'
import { CartPage } from './pages/localSeller/CartPage.tsx'
import { LocalSellerProductsPage } from './pages/localSeller/LocalSellerProductsPage.tsx'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage.tsx'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.tsx'
import { InvoicesPage } from './pages/localSeller/InvoicesPage.tsx'
import { InvoiceDetailPage } from './pages/localSeller/InvoiceDetailPage.tsx'
import { LsOrdersPage } from './pages/localSeller/LsOrdersPage.tsx'
import { LsOrderDetailPage } from './pages/localSeller/LsOrderDetailPage.tsx'
import { CheckoutPage } from './pages/localSeller/CheckoutPage.tsx'
import { WholesalerInvoiceDetailPage } from './pages/wholesaler/InvoiceDetailPage.tsx'
import { WholesalerInvoicesPage } from './pages/wholesaler/InvoicesPage.tsx'

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      {/* Wholesaler Panel */}
      <Route path="/wholesaler" element={<WholesalerLayout />}>
        <Route index element={<WholesalerDashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="subscription-requests" element={<WholesalerSubscriptionRequests />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="salesmen" element={<SalesmenPage />} />
        <Route path="salesmen/create" element={<CreateSalesmanPage />} />
        <Route path="salesmen/:id" element={<SalesmanDetailsPage />} />
        <Route path="salesmen/:id/edit" element={<EditSalesmanPage />} />
        <Route path="salesmen/:id/assign" element={<AssignSellersPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="invoices" element={<WholesalerInvoicesPage />} />
        <Route path="invoices/:orderId" element={<WholesalerInvoiceDetailPage />} />
      </Route>

      {/* Salesman Routes - Only SALESMAN can access */}
      <Route element={<RoleBasedRoute allowedRoles={['SALESMAN']} />}>
        <Route path="/salesman" element={<SalesmanLayout />}>
          <Route index element={<SalesmanDashboard />} />
          <Route path="assigned-sellers" element={<AssignedSellersPage />} />
          <Route path="sellers/:sellerId/orders" element={<SellerOrdersPage />} />
          <Route path="orders" element={<AllOrdersPage />} />
          <Route path="orders/:orderId" element={<SalesmanOrderDetailPage />} />
          <Route path="orders/:orderId/deliver" element={<DeliverOrderPage />} />
        </Route>
      </Route>

      <Route path="/local-seller" element={<LocalSellerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<LocalSellerDashboard />} />
        <Route path="wholesalers" element={<WholesalersPage />} />
        <Route path="wholesaler/:id" element={<WholesalerProductViews />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<LsOrdersPage />} />
        <Route path="orders/:orderId" element={<LsOrderDetailPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/:orderId" element={<InvoiceDetailPage />} />
        <Route path="products" element={<LocalSellerProductsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={
        user ? (
          user.role === 'WHOLESALER' ? <Navigate to="/wholesaler" replace /> :
            user.role === 'SALESMAN' ? <Navigate to="/salesman" replace /> :
              user.role === 'LOCAL_SELLER' ? <Navigate to="/local-seller" replace /> :
                <Navigate to="/auth/login" replace />
        ) : (
          <Navigate to="auth/login" replace />
        )
      } />
    </Routes>
  );
}

export default App

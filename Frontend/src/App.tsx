import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.tsx'
import { LoginPage } from './pages/auth/LoginPage.tsx'
import { RegisterPage } from './pages/auth/RegisterPage.tsx'
import { WholesalerLayout } from './pages/wholesaler/WholesalerLayout.tsx'
import { WholesalerDashboard } from './pages/wholesaler/WholesalerDashboard.tsx'
import { ProductsPage } from './pages/wholesaler/ProductsPage.tsx'
import LandingPage from "./pages/LandingPage";
import { LocalSellerLayout } from "./pages/localSeller/layout.tsx";
//import { WholesalersPage } from "./pages/localSeller/WholesalersPage";
import  {LocalSellerDashboard } from "./pages/localSeller/LocalSellerDashboard.tsx";
import  {WholesalersPage}  from './pages/localSeller/WholesalersPage.tsx'
import  {WholesalerProductViews}  from './pages/localSeller/wholesaler/WholesalerProductViews.tsx'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" aria-label="Loading" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>

        {/* Wholesaler Panel */}
        <Route path="/wholesaler" element={<WholesalerLayout />}>
          <Route index element={<WholesalerDashboard />} />
          <Route path="products" element={<ProductsPage />} />
        </Route>

<Route path="/local-seller" element={<LocalSellerLayout />}>
<Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<LocalSellerDashboard />} />
  <Route path="wholesalers" element={<WholesalersPage />} />
  <Route path="wholesaler/:id" element={<WholesalerProductViews />} />
  <Route path="/local-seller/products" element={<ProductsPage />} />
</Route>

</Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default App

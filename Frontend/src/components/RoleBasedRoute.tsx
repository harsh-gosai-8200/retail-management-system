import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  allowedRoles: string[];
  redirectPath?: string;
}

export function RoleBasedRoute({ allowedRoles, redirectPath = '/auth/login' }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'WHOLESALER') return <Navigate to="/wholesaler" replace />;
    if (user?.role === 'SALESMAN') return <Navigate to="/salesman" replace />;
    if (user?.role === 'LOCAL_SELLER') return <Navigate to="/local-seller" replace />;
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Store,
  Briefcase,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  CreditCard,
  Ticket,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import { Button } from '../../components/ui/button';
import type { AdminUser } from '../../types/admin';

export function AdminUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const data = await adminService.getUserDetails(parseInt(userId!));
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    setToggling(true);
    try {
      const updated = await adminService.toggleUserStatus(user.id);
      setUser(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error || 'User not found'}</span>
        </div>
      </div>
    );
  }

  const queryId = user.profileId || user.id;
  const isLocalSeller = user.role === 'LOCAL_SELLER';
  const isWholesaler = user.role === 'WHOLESALER';
  const isSalesman = user.role === 'SALESMAN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>
        <Button
          onClick={handleToggleStatus}
          disabled={toggling}
          className={user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : user.isActive ? (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Deactivate User
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Activate User
            </>
          )}
        </Button>
      </div>

      {/* User Profile Card */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{user.username}</h2>
              <div className="flex items-center gap-3 mt-1">
                <AdminStatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} type="user" />
                <span className="text-sm text-slate-500">{user.role}</span>
                {user.profileId && (
                  <span className="text-xs text-slate-400">Profile ID: {user.profileId}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Information */}
            <div>
              <h3 className="mb-3 font-medium text-slate-900">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Role-specific Information */}
            <div>
              <h3 className="mb-3 font-medium text-slate-900">
                {isWholesaler && 'Business Information'}
                {isLocalSeller && 'Shop Information'}
                {isSalesman && 'Work Information'}
              </h3>
              <div className="space-y-3">
                {isWholesaler && user.businessName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{user.businessName}</span>
                  </div>
                )}
                {isLocalSeller && user.shopName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{user.shopName}</span>
                  </div>
                )}
                {isSalesman && user.region && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Region: {user.region}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Role Based */}
      <div className="grid gap-4 md:grid-cols-3">
        
        {/* PAYMENT HISTORY - For LOCAL_SELLER and WHOLESALER */}
        {(isLocalSeller || isWholesaler) && (
          <button
            onClick={() => navigate(`/admin/payments?userId=${user.id}&profileId=${user.profileId}&role=${user.role}`)}
            className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <CreditCard className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Payment History</h3>
            <p className="mt-1 text-sm text-slate-500">
              View all payments made by this {isLocalSeller ? 'seller' : 'wholesaler'}
            </p>
          </button>
        )}

        {/* PAYMENT COLLECTION - For SALESMAN */}
        {isSalesman && (
          <button
            onClick={() => navigate(`/admin/salesman-collections/${user.profileId || user.id}`)}
            className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <DollarSign className="h-8 w-8 text-green-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Payment Collections</h3>
            <p className="mt-1 text-sm text-slate-500">
              View all cash collections made by this salesman
            </p>
          </button>
        )}

        {/* SUPPORT TICKETS - For ALL ROLES
        <button
          onClick={() => navigate(`/admin/tickets?userId=${queryId}&role=${user.role}`)}
          className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Ticket className="h-8 w-8 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Support Tickets</h3>
          <p className="mt-1 text-sm text-slate-500">
            View all support tickets raised by this user
          </p>
        </button> */}

        {/* ORDER HISTORY - For LOCAL_SELLER only */}
        {isLocalSeller && (
          <button
           onClick={() => navigate(`/admin/orders?userId=${user.id}&profileId=${user.profileId}&role=${user.role}`)}
            className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Order History</h3>
            <p className="mt-1 text-sm text-slate-500">
              View all orders placed by this seller
            </p>
          </button>
        )}
      </div>
    </div>
  );
}
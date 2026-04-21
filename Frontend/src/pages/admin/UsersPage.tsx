import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  UserCheck,
  UserX,
  Eye
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import { AdminFilterBar } from '../../components/admin/AdminFilterBar';
import { Button } from '../../components/ui/button';
import type { AdminUser, PaginatedResponse } from '../../types/admin';

const PAGE_SIZE = 10;

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'WHOLESALER', label: 'Wholesaler' },
  { value: 'LOCAL_SELLER', label: 'Local Seller' },
  { value: 'SALESMAN', label: 'Salesman' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter state
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, [page, search, role, status]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers(
        role || undefined,
        status === '' ? undefined : status === 'true',
        search || undefined,
        page,
        PAGE_SIZE
      );
      setUsers(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    setTogglingId(userId);
    try {
      await adminService.toggleUserStatus(userId);
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setPage(0);
  };

  const pageNumber = page + 1;

  const hasFilters = search || role || status;

  if (loading && users.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all users across the platform
        </p>
      </div>

      {/* Filters */}
      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        statusOptions={statusOptions}
        statusValue={status}
        onStatusChange={setStatus}
        roleOptions={roleOptions}
        roleValue={role}
        onRoleChange={setRole}
        onClearFilters={handleClearFilters}
        hasFilters={hasFilters}
      />

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{users.length}</span> of{' '}
          <span className="font-medium text-slate-700">{totalElements}</span> users
        </p>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No users found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {hasFilters ? 'Try adjusting your filters' : 'No users registered yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{user.username}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {user.role}
                    </span>
                    {user.businessName && (
                      <div className="text-xs text-slate-400 mt-1">{user.businessName}</div>
                    )}
                    {user.shopName && (
                      <div className="text-xs text-slate-400 mt-1">{user.shopName}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-slate-600">{user.phone}</div>
                    <div className="text-xs text-slate-400">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <AdminStatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} type="user" />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="rounded-md bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={togglingId === user.id}
                        className={`rounded-md p-2 ${
                          user.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {togglingId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : user.isActive ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <footer className="flex items-center justify-between text-xs text-slate-500">
          <p>
            Page <span className="font-semibold text-slate-900">{pageNumber}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span> ·{' '}
            <span className="font-semibold text-slate-900">{totalElements}</span> total users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-xl"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
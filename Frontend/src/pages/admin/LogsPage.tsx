import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Loader2, 
  AlertCircle,
  Search,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/button';
import type { SystemLog } from '../../types/admin';

const PAGE_SIZE = 20;

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'LOGIN_SUCCESS', label: 'Login Success' },
  { value: 'USER_REGISTERED', label: 'User Registered' },
  { value: 'ORDER_PLACED', label: 'Order Placed' },
  { value: 'ORDER_CANCELLED', label: 'Order Cancelled' },
  { value: 'PAYMENT_SUCCESS', label: 'Payment Success' },
  { value: 'REFUND_PROCESSED', label: 'Refund Processed' },
  { value: 'USER_STATUS_TOGGLED', label: 'User Status Toggled' },
  { value: 'SUBSCRIPTION_ACTIVATED', label: 'Subscription Activated' },
  { value: 'TICKET_CREATED', label: 'Ticket Created' },
  { value: 'TICKET_REPLIED', label: 'Ticket Replied' },
  { value: 'INVOICE_GENERATED', label: 'Invoice Generated' },
];

export function AdminLogsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdFromUrl = searchParams.get('userId');
  
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);

  const [userId, setUserId] = useState<number | undefined>(userIdFromUrl ? parseInt(userIdFromUrl) : undefined);
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (userId) {
      adminService.getUserDetails(userId).then(setUserInfo).catch(console.error);
    } else {
      setUserInfo(null);
    }
  }, [userId]);

  useEffect(() => {
    loadLogs();
  }, [page, action, startDate, endDate, userId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSystemLogs(
        userId,
        action || undefined,
        startDate || undefined,
        endDate || undefined,
        page,
        PAGE_SIZE
      );
      setLogs(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      console.error('Error loading logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setAction('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleClearUserFilter = () => {
    setUserId(undefined);
    setPage(0);
    navigate('/admin/logs');
  };

  const handleRefresh = () => {
    loadLogs();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-700';
    if (action.includes('ORDER')) return 'bg-purple-100 text-purple-700';
    if (action.includes('PAYMENT') || action.includes('REFUND')) return 'bg-green-100 text-green-700';
    if (action.includes('USER')) return 'bg-indigo-100 text-indigo-700';
    if (action.includes('TICKET')) return 'bg-yellow-100 text-yellow-700';
    if (action.includes('SUBSCRIPTION')) return 'bg-pink-100 text-pink-700';
    return 'bg-slate-100 text-slate-700';
  };

  const pageNumber = page + 1;
  const hasFilters = action || startDate || endDate || userId;

  if (loading && logs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
          <p className="mt-1 text-sm text-slate-500">
            View all user activity and system events
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* User Filter Banner */}
      {userId && userInfo && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-700">
                Showing logs for: <strong>{userInfo.username}</strong> ({userInfo.email})
              </span>
            </div>
            <button
              onClick={handleClearUserFilter}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              {actionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
          <Button variant="outline" onClick={handleClearFilters} className="h-10">
            Clear
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-700">{logs.length}</span> of{' '}
          <span className="font-medium text-slate-700">{totalElements}</span> logs
        </p>
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No logs found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {hasFilters ? 'Try adjusting your filters' : 'No system logs available'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">
                      {log.userName || 'System'}
                    </div>
                    {log.userRole && (
                      <div className="text-xs text-slate-500">{log.userRole}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                    <div className="truncate" title={log.details || ''}>
                      {log.details || '-'}
                    </div>
                    {log.entityType && (
                      <div className="text-xs text-slate-400 mt-1">
                        {log.entityType}: {log.entityId}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 font-mono">
                    {log.ipAddress || '-'}
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
            <span className="font-semibold text-slate-900">{totalElements}</span> total logs
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
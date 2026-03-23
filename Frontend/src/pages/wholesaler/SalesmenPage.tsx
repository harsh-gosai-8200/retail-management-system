import { useState, useEffect, useTransition, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, AlertCircle, Users } from 'lucide-react';
import { salesmanService } from '../../services/salesmanService';
import { SalesmanTable } from './components/salesman/SalesmanTable'; 
import { SalesmanFilters } from './components/salesman/SalesmanFilters';
import type { Salesman } from '../../types/wholesalerSalesman';

export function SalesmenPage() {
  const navigate = useNavigate();
  const wholesalerId = localStorage.getItem('profile_id');

  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    totalPages: 0,
    totalItems: 0,
  });
  const [isPending, startTransition] = useTransition();

  const filtersComponent = useMemo(() => (
      <SalesmanFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        onClearFilters={() => {
          setSearch('');
          setStatusFilter('');
          setRegionFilter('');
        }}
      />
      ), [search, statusFilter, regionFilter]);

  const fetchSalesmen = (page: number = 0) => {
    setLoading(true);
    startTransition(async () => {
      try {
        const response = await salesmanService.getSalesmen(
          Number(wholesalerId),
          page,
          10,
          search || undefined,
          statusFilter ? statusFilter === 'ACTIVE' : undefined,
          regionFilter || undefined
        );

        console.log('Fetched response:', response); // Debug log

        setSalesmen(response.salesmen);
        setPagination({
          page,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
        });
        setError(null);
      } catch (err: any) {
        console.error('Fetch error:', err); // Debug log
        setError(err?.message ?? 'Failed to load salesmen');
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (wholesalerId) {
      fetchSalesmen(0);
    }
  }, [wholesalerId, search, statusFilter, regionFilter]);

  // Debug render
  console.log('Rendering with salesmen:', salesmen);

  if (loading && salesmen.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleToggleStatus = async (salesmanId: number, active: boolean) => {
    try {
      await salesmanService.toggleStatus(Number(wholesalerId), salesmanId, active);
      fetchSalesmen(pagination.page);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update status');
    }
  };

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Salesmen</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your sales team and their assignments
          </p>
        </div>
        <button
          onClick={() => navigate('/wholesaler/salesmen/create')}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-200 transition-all hover:scale-[1.02] hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Salesman
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <SalesmanFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        onClearFilters={() => {
          setSearch('');
          setStatusFilter('');
          setRegionFilter('');
        }}
      />

      {salesmen.length === 0 && !loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-slate-100 p-3">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No salesmen found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Get started by adding your first salesman
            </p>
            <button
              onClick={() => navigate('/wholesaler/salesmen/create')}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Salesman
            </button>
          </div>
        </div>
      ) : (
        <SalesmanTable salesmen={salesmen} onToggleStatus={handleToggleStatus} />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3">
          <div className="text-sm text-slate-700">
            Showing <span className="font-medium">{pagination.page * 10 + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min((pagination.page + 1) * 10, pagination.totalItems)}
            </span>{' '}
            of <span className="font-medium">{pagination.totalItems}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchSalesmen(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchSalesmen(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
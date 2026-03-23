import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  regionFilter: string;
  onRegionFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export const SalesmanFilters: React.FC<Props> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  regionFilter,
  onRegionFilterChange,
  onClearFilters,
}) => {
  const hasFilters = search || statusFilter || regionFilter;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Search
          </label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Name, email, employee ID..."
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Region
          </label>
          <input
            type="text"
            value={regionFilter}
            onChange={(e) => onRegionFilterChange(e.target.value)} 
            placeholder="Filter by region..."
            className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-3 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
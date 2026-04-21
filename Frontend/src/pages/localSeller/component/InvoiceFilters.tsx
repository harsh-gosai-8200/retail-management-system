import React from 'react';
import { Search, X, Calendar, Filter, IndianRupee } from 'lucide-react';
import type { InvoiceFilters as Filters } from '../../../types/invoice';

interface Props {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
}

export const InvoiceFilters: React.FC<Props> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const hasFilters = filters.status || filters.search || filters.startDate || 
                     filters.endDate || filters.minAmount || filters.maxAmount;

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'GENERATED', label: 'Generated' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PAID', label: 'Paid' },
  ];

  const sortOptions = [
    { value: 'generatedAt,desc', label: 'Newest First' },
    { value: 'generatedAt,asc', label: 'Oldest First' },
    { value: 'totalAmount,desc', label: 'Highest Amount' },
    { value: 'totalAmount,asc', label: 'Lowest Amount' },
    { value: 'invoiceNumber,asc', label: 'Invoice Number' },
  ];

  const handleSortChange = (value: string) => {
    const [sortBy, sortDir] = value.split(',');
    onFilterChange({ sortBy, sortDir: sortDir as 'asc' | 'desc', page: 0 });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-medium text-slate-700">Filters</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Search
          </label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value, page: 0 })}
              placeholder="Invoice # or Order #..."
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
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ status: e.target.value || undefined, page: 0 })}
            className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            From Date
          </label>
          <div className="relative mt-1">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange({ startDate: e.target.value || undefined, page: 0 })}
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            To Date
          </label>
          <div className="relative mt-1">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange({ endDate: e.target.value || undefined, page: 0 })}
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Min Amount (₹)
          </label>
          <div className="relative mt-1">
            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              value={filters.minAmount || ''}
              onChange={(e) => onFilterChange({ minAmount: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
              placeholder="Min"
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Max Amount (₹)
          </label>
          <div className="relative mt-1">
            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              value={filters.maxAmount || ''}
              onChange={(e) => onFilterChange({ maxAmount: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
              placeholder="Max"
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Sort By
          </label>
          <select
            value={`${filters.sortBy},${filters.sortDir}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Items Per Page */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
            Items Per Page
          </label>
          <select
            value={filters.size}
            onChange={(e) => onFilterChange({ size: Number(e.target.value), page: 0 })}
            className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
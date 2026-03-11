import React from 'react';
import { Search } from 'lucide-react';
import type { OrderFilters, OrderStatus } from '../../../types/order';

interface Props {
  filters: OrderFilters;
  onFilterChange: (filters: Partial<OrderFilters>) => void;  
}

const statusOptions: (OrderStatus | 'ALL')[] = [
  'ALL',
  'PENDING',
  'APPROVED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REJECTED',
];

export const OrderFiltersComponent: React.FC<Props> = ({ filters, onFilterChange }) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      status: value === 'ALL' ? undefined : value as OrderStatus,
      page: 0,  
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ 
      search: e.target.value || undefined,  
      page: 0 
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortDir] = e.target.value.split(',');
    onFilterChange({ 
      sortBy, 
      sortDir: sortDir as 'asc' | 'desc',
      page: 0 
    });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      size: Number(e.target.value), 
      page: 0  
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Order # or Seller..."
              className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={filters.status || 'ALL'}
            onChange={handleStatusChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'All Orders' : status}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            value={`${filters.sortBy},${filters.sortDir}`}
            onChange={handleSortChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="orderDate,desc">Newest First</option>
            <option value="orderDate,asc">Oldest First</option>
            <option value="totalAmount,desc">Highest Amount</option>
            <option value="totalAmount,asc">Lowest Amount</option>
          </select>
        </div>

        {/* Page Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Items Per Page
          </label>
          <select
            value={filters.size}
            onChange={handleSizeChange}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
};
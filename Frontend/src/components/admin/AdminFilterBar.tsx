import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  paymentMethodOptions?: { value: string; label: string }[];
  paymentMethodValue?: string;
  onPaymentMethodChange?: (value: string) => void;
  roleOptions?: { value: string; label: string }[];
  roleValue?: string;
  onRoleChange?: (value: string) => void;
  dateRange?: { start: string; end: string };
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  onClearFilters?: () => void;
  hasFilters?: boolean | number | string; 
}

export const AdminFilterBar: React.FC<Props> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusOptions,
  statusValue,
  onStatusChange,
  paymentMethodOptions, 
  paymentMethodValue,    
  onPaymentMethodChange,
  roleOptions,
  roleValue,
  onRoleChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  hasFilters = false,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-medium text-slate-700">Filters</h3>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        {statusOptions && onStatusChange && (
          <div className="w-40">
            <select
              value={statusValue}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {paymentMethodOptions && onPaymentMethodChange && (
          <div className="w-40">
            <select
              value={paymentMethodValue}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {paymentMethodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Role Filter */}
        {roleOptions && onRoleChange && (
          <div className="w-40">
            <select
              value={roleValue}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range */}
        {dateRange && onDateRangeChange && (
          <>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="self-center text-slate-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </>
        )}

        {/* Clear Filters */}
        {hasFilters && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-slate-500"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
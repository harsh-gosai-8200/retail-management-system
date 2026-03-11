import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { OrderStatsCard } from './components/OrderStats';
import { OrderFiltersComponent } from './components/OrderFilters';
import { OrderTable } from './components/OrderTable';
import { StatusUpdateModal } from './components/StatusUpdateModal';
import type { Order } from '../../types/order';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const {
    orders,
    loading,
    error,
    stats,
    filters,
    pagination,
    updateFilters,  
    approveOrder,
    rejectOrder,
    updateStatus,
  } = useOrders(user?.id || 0);

  const handleApprove = async (orderId: number) => {
    if (window.confirm('Are you sure you want to approve this order?')) {
      const success = await approveOrder(orderId);
      if (success) {
        // Optionally show success message
      }
    }
  };

  const handleReject = async (orderId: number) => {
    const reason = window.prompt('Please enter rejection reason:');
    if (reason) {
      const success = await rejectOrder(orderId, reason);
      if (success) {
        // Optionally show success message
      }
    }
  };

  const handleUpdateStatus = async (orderId: number, data: any) => {
    const success = await updateStatus(orderId, data);
    if (success) {
      setShowStatusModal(false);
      setSelectedOrder(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage });  // ✅ Use updateFilters
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and process customer orders
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <OrderStatsCard stats={stats} />
      <OrderFiltersComponent filters={filters} onFilterChange={updateFilters} /> 
      
      <OrderTable orders={orders} loading={loading} />

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {pagination.page * pagination.size + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    (pagination.page + 1) * pagination.size,
                    pagination.totalElements
                  )}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalElements}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedOrder && (
        <StatusUpdateModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
          onConfirm={(data) => handleUpdateStatus(selectedOrder.id, data)}
          currentStatus={selectedOrder.status}
        />
      )}
    </div>
  );
};
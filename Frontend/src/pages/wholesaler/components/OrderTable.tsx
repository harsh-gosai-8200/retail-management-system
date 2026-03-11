import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '../../../types/order';

interface Props {
  orders: Order[];
  loading: boolean;
}

export const OrderTable: React.FC<Props> = ({ orders, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Order #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Seller
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => (
            <tr 
              key={order.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/wholesaler/orders/${order.id}`)}
            >
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {order.orderNumber}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                <div>{order.sellerShopName}</div>
                <div className="text-xs text-gray-400">{order.sellerName}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {formatDate(order.orderDate)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                {order.totalItems}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {formatCurrency(order.totalAmount)}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/wholesaler/orders/${order.id}`);
                  }}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
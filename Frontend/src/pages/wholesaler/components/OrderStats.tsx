import React from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  IndianRupee 
} from 'lucide-react';
import type { OrderStats } from '../../../types/order';

interface Props {
  stats: OrderStats | null;
}

export const OrderStatsCard: React.FC<Props> = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pending',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Approved',
      value: stats.approvedOrders,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Processing',
      value: stats.processingOrders,
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Shipped',
      value: stats.shippedOrders,
      icon: Truck,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Delivered',
      value: stats.deliveredOrders,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Rejected',
      value: stats.rejectedOrders,
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Today\'s Revenue',
      value: `₹${stats.todayRevenue?.toLocaleString('en-IN') || 0}`,
      icon: IndianRupee,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {card.value}
              </p>
            </div>
            <div className={`rounded-lg p-2 ${card.color}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
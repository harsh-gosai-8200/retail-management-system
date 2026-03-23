import React from 'react';
import type { OrderStatus } from '../../../../types/order';

interface Props {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  PENDING: { 
    color: 'text-yellow-800', 
    bg: 'bg-yellow-100', 
    label: 'Pending' 
  },
  APPROVED: { 
    color: 'text-blue-800', 
    bg: 'bg-blue-100', 
    label: 'Approved' 
  },
  PROCESSING: { 
    color: 'text-purple-800', 
    bg: 'bg-purple-100', 
    label: 'Processing' 
  },
  SHIPPED: { 
    color: 'text-indigo-800', 
    bg: 'bg-indigo-100', 
    label: 'Shipped' 
  },
  DELIVERED: { 
    color: 'text-green-800', 
    bg: 'bg-green-100', 
    label: 'Delivered' 
  },
  CANCELLED: { 
    color: 'text-gray-800', 
    bg: 'bg-gray-100', 
    label: 'Cancelled' 
  },
  REJECTED: { 
    color: 'text-red-800', 
    bg: 'bg-red-100', 
    label: 'Rejected' 
  },
};

export const OrderStatusBadge: React.FC<Props> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.PENDING;
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
};
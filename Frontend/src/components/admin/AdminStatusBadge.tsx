import React from 'react';

interface Props {
  status: string;
  type?: 'user' | 'ticket' | 'payment' | 'subscription';
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  // User status
  ACTIVE: { color: 'text-green-800', bg: 'bg-green-100', label: 'Active' },
  INACTIVE: { color: 'text-red-800', bg: 'bg-red-100', label: 'Inactive' },
  
  // Ticket status
  OPEN: { color: 'text-yellow-800', bg: 'bg-yellow-100', label: 'Open' },
  IN_PROGRESS: { color: 'text-blue-800', bg: 'bg-blue-100', label: 'In Progress' },
  RESOLVED: { color: 'text-green-800', bg: 'bg-green-100', label: 'Resolved' },
  CLOSED: { color: 'text-gray-800', bg: 'bg-gray-100', label: 'Closed' },
  
  // Ticket priority
  LOW: { color: 'text-gray-800', bg: 'bg-gray-100', label: 'Low' },
  MEDIUM: { color: 'text-blue-800', bg: 'bg-blue-100', label: 'Medium' },
  HIGH: { color: 'text-orange-800', bg: 'bg-orange-100', label: 'High' },
  URGENT: { color: 'text-red-800', bg: 'bg-red-100', label: 'Urgent' },
  
  // Subscription status
  PENDING: { color: 'text-yellow-800', bg: 'bg-yellow-100', label: 'Pending' },
  ACTIVE_SUB: { color: 'text-green-800', bg: 'bg-green-100', label: 'Active' },
  EXPIRED: { color: 'text-red-800', bg: 'bg-red-100', label: 'Expired' },
  CANCELLED: { color: 'text-gray-800', bg: 'bg-gray-100', label: 'Cancelled' },
};

export const AdminStatusBadge: React.FC<Props> = ({ status, type = 'user' }) => {
  let key = status;
  
  // Map for different types
  if (type === 'subscription' && status === 'ACTIVE') key = 'ACTIVE_SUB';
  
  const config = statusConfig[key] || { color: 'text-gray-800', bg: 'bg-gray-100', label: status };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
};
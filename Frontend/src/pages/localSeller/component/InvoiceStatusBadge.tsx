import React from 'react';

interface Props {
  status: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  GENERATED: { color: 'bg-blue-100 text-blue-700', label: 'Generated' },
  PENDING: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
  PAID: { color: 'bg-green-100 text-green-700', label: 'Paid' },
};

export const InvoiceStatusBadge: React.FC<Props> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};
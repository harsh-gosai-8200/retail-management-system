import React from 'react';

interface Props {
  status: 'ACTIVE' | 'INACTIVE';
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    INACTIVE: 'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};
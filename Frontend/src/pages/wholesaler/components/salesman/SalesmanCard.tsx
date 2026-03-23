import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Users, Phone, Mail, User } from 'lucide-react';
import { StatusBadge } from '../order/StatusBadge';
import type { Salesman } from '../../../../types/wholesalerSalesman';

interface Props {
  salesman: Salesman;
  onToggleStatus: (id: number, active: boolean) => void;
}

export const SalesmanCard: React.FC<Props> = ({ salesman, onToggleStatus }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{salesman.fullName}</h3>
            <p className="text-sm text-slate-500">{salesman.employeeId}</p>
          </div>
        </div>
        <StatusBadge status={salesman.status} />
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="h-4 w-4" />
          <span>{salesman.email}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="h-4 w-4" />
          <span>{salesman.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="h-4 w-4" />
          <span>{salesman.region}</span>
        </div>
        {salesman.department && (
          <div className="flex items-center gap-2 text-slate-600">
            <Briefcase className="h-4 w-4" />
            <span>{salesman.department}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-slate-600">
          <Users className="h-4 w-4" />
          <span>{salesman.assignedSellersCount} sellers assigned</span>
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 pt-4">
        <button
          onClick={() => navigate(`/wholesaler/salesmen/${salesman.id}`)}
          className="flex-1 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          View Details
        </button>
        <button
          onClick={() => onToggleStatus(salesman.id, salesman.status === 'INACTIVE')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            salesman.status === 'ACTIVE'
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {salesman.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  );
};
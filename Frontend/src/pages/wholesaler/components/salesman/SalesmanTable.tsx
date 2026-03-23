import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Eye, ToggleLeft, ToggleRight, MapPin, Users } from 'lucide-react';
import { StatusBadge } from '../order/StatusBadge'; 
import type { Salesman } from '../../../../types/wholesalerSalesman';

interface Props {
  salesmen: Salesman[];
  onToggleStatus: (id: number, active: boolean) => void;
}

export const SalesmanTable: React.FC<Props> = ({ salesmen, onToggleStatus }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Employee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Region
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Assigned
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {salesmen.map((salesman) => (
            <tr key={salesman.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900">{salesman.fullName}</div>
                <div className="text-xs text-slate-500">{salesman.employeeId}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-slate-600">{salesman.email}</div>
                <div className="text-xs text-slate-500">{salesman.phone}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <MapPin className="h-3 w-3" />
                  {salesman.region}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Users className="h-3 w-3" />
                  {salesman.assignedSellersCount}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={salesman.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => navigate(`/wholesaler/salesmen/${salesman.id}`)}
                    className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/wholesaler/salesmen/${salesman.id}/edit`)}
                    className="rounded-md bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(salesman.id, salesman.status === 'INACTIVE')}
                    className={`rounded-md p-2 ${
                      salesman.status === 'ACTIVE'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                    title={salesman.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  >
                    {salesman.status === 'ACTIVE' ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
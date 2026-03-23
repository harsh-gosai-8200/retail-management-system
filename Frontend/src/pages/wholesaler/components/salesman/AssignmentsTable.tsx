import React from 'react';
import { XCircle } from 'lucide-react';
import type { SalesmanAssignment } from '../../../../types/wholesalerSalesman'; 

interface Props {
  assignments: SalesmanAssignment[];
  onRemove: (assignmentId: number) => void;
}

export const AssignmentsTable: React.FC<Props> = ({ assignments, onRemove }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Salesman
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Seller
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Assigned Date
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
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm font-medium text-slate-900">
                  {assignment.salesmanName}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-slate-600">{assignment.sellerShop}</div>
                <div className="text-xs text-slate-500">{assignment.sellerName}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                {new Date(assignment.assignedAt).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  {assignment.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                <button
                  onClick={() => onRemove(assignment.id)}
                  className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100"
                  title="Remove Assignment"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
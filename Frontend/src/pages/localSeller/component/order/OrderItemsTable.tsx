import React from 'react';
import type { OrderItem } from '../../../../types/lsorder'; 

interface Props {
  items: OrderItem[];
  totalAmount: number;
}

export const OrderItemsTable: React.FC<Props> = ({ items, totalAmount }) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = totalAmount - subtotal;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Product
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
              Quantity
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
              Price
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {items.map((item, index) => (
            <tr key={index}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                {item.productName}
                <div className="text-xs text-slate-400">SKU: {item.productSku}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                {item.quantity}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600">
                ₹{item.price.toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                ₹{item.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-slate-50">
          <tr>
            <td colSpan={3} className="px-6 py-4 text-right text-sm text-slate-600">
              Subtotal
            </td>
            <td className="px-6 py-4 text-right text-sm text-slate-900">
              ₹{subtotal.toLocaleString()}
            </td>
          </tr>
          {tax > 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-right text-sm text-slate-600">
                Tax & Fees
              </td>
              <td className="px-6 py-4 text-right text-sm text-slate-600">
                ₹{tax.toLocaleString()}
              </td>
            </tr>
          )}
          <tr className="border-t border-slate-200">
            <td colSpan={3} className="px-6 py-4 text-right text-base font-bold text-slate-900">
              Total
            </td>
            <td className="px-6 py-4 text-right text-base font-bold text-blue-600">
              ₹{totalAmount.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
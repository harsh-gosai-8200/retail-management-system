import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { SalesmanOrder } from '../../../types/salesman';

interface Props {
  order: SalesmanOrder;
}

export const OrderCard: React.FC<Props> = ({ order }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/salesman/orders/${order.orderId}`)}
      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-slate-100 p-3">
            <Package className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{order.orderNumber}</h3>
            <p className="text-sm text-slate-500">
              {order.itemCount} items · ₹{order.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <OrderStatusBadge status={order.status} />
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(order.orderDate).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {order.deliveryAddress}
        </div>
      </div>

      {order.status === 'SHIPPED' && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/salesman/orders/${order.orderId}/deliver`);
            }}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Mark as Delivered
          </button>
        </div>
      )}
    </div>
  );
};
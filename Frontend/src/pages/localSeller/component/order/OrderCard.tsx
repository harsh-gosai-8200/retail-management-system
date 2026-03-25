import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, MapPin, Store, ChevronRight } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order } from '../../../../types/lsorder';

interface Props {
  order: Order;
}

export const OrderCard: React.FC<Props> = ({ order }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/local-seller/orders/${order.id}`)}
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
              <Store className="inline h-3 w-3 mr-1" />
              {order.wholesalerName} · {order.totalItems} items · ₹{order.totalAmount.toLocaleString()}
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
    </div>
  );
};
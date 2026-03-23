import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Phone, MapPin, Package, Clock, ChevronRight } from 'lucide-react';
import type { AssignedSeller } from '../../../types/salesman';

interface Props {
  seller: AssignedSeller;
}

export const SellerCard: React.FC<Props> = ({ seller }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/salesman/sellers/${seller.sellerId}/orders`)}
      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-3">
            <Store className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{seller.shopName}</h3>
            <p className="text-sm text-slate-600">{seller.ownerName}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Phone className="h-4 w-4" />
          {seller.phone}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          {seller.address}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-600">
            {seller.pendingOrders} pending
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-green-600" />
          <span className="text-sm text-slate-600">
            {seller.totalOrders} total
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Last order: {seller.lastOrderDate}
      </div>
    </div>
  );
};
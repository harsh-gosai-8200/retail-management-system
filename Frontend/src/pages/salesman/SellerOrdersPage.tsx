import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Package,
  User,
  Phone,
  MapPin,
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { salesmanSelfService } from '../../services/salesmanSelfService';
import { OrderCard } from './component/OrderCard';
import type { SalesmanOrder } from '../../types/salesman';

export function SellerOrdersPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesmanOrder[]>([]);
  const [sellerInfo, setSellerInfo] = useState<{ shop: string; name: string; phone: string; address: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (sellerId) {
      loadOrders();
    } else {
      setError('Invalid seller ID');
      setLoading(false);
    }
  }, [sellerId, statusFilter]);

  const loadOrders = async () => {
    try {
      const parsedSellerId = parseInt(sellerId!, 10);
      
      if (isNaN(parsedSellerId)) {
        setError('Invalid seller ID format');
        setLoading(false);
        return;
      }

      const data = await salesmanSelfService.getSellerOrders(parsedSellerId, statusFilter);
      setOrders(data);
      
      if (data.length > 0) {
        setSellerInfo({
          shop: data[0].sellerShop,
          name: data[0].sellerName,
          phone: data[0].sellerPhone,
          address: data[0].sellerAddress,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'SHIPPED', label: 'To Deliver' },
    { value: 'DELIVERED', label: 'Delivered' },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/salesman/assigned-sellers')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sellers
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
      </div>

      {sellerInfo && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{sellerInfo.shop}</h2>
              <p className="text-sm text-slate-500">{sellerInfo.name}</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {sellerInfo.phone}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {sellerInfo.address}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              statusFilter === filter.value
                ? filter.value === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : filter.value === 'SHIPPED'
                  ? 'bg-indigo-600 text-white'
                  : filter.value === 'DELIVERED'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No orders found</h3>
          <p className="mt-2 text-sm text-slate-500">
            There are no orders matching your filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
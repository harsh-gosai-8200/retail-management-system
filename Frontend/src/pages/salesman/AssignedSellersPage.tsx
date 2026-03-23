import { useState, useEffect } from 'react';
import { Store, Loader2, AlertCircle } from 'lucide-react';
import { salesmanSelfService } from '../../services/salesmanSelfService';
import { SellerCard } from './component/SellerCard'; 
import type { AssignedSeller } from '../../types/salesman';

export function AssignedSellersPage() {
  const [sellers, setSellers] = useState<AssignedSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const data = await salesmanSelfService.getAssignedSellers();
      setSellers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Assigned Sellers</h1>
        <p className="mt-1 text-sm text-slate-500">
          You have {sellers.length} seller{sellers.length !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {sellers.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <Store className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No sellers assigned</h3>
          <p className="mt-2 text-sm text-slate-500">
            Wait for the wholesaler to assign sellers to you
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sellers.map((seller) => (
            <SellerCard key={seller.sellerId} seller={seller} />
          ))}
        </div>
      )}
    </div>
  );
}
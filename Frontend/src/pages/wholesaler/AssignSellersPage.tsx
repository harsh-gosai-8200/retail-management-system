import { useState, useEffect, useTransition, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Store, 
  Phone, 
  MapPin,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Save,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { salesmanService } from '../../services/salesmanService';
import type { Salesman, Seller, SalesmanAssignment } from '../../types/wholesalerSalesman';

export function AssignSellersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [salesman, setSalesman] = useState<Salesman | null>(null);
  const [availableSellers, setAvailableSellers] = useState<Seller[]>([]);
  const [assignedSellers, setAssignedSellers] = useState<SalesmanAssignment[]>([]);
  const [selectedSellers, setSelectedSellers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user?.id && id) {
      loadData();
    }
  }, [user?.id, id]);

  const loadData = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        // Fetch salesman details
        const salesmanData = await salesmanService.getSalesman(user?.id!, parseInt(id!));
        setSalesman(salesmanData);

        const available = await salesmanService.getAvailableSellers(user?.id!);
        setAvailableSellers(Array.isArray(available) ? available : []);

        const assigned = await salesmanService.getAssignedSellers(user?.id!, parseInt(id!));
        const assignedArray = Array.isArray(assigned) ? assigned : [];
        setAssignedSellers(assignedArray);
        
        const assignedIds = new Set(assignedArray.map(a => a.sellerId));
        setSelectedSellers(assignedIds);

        setError(null);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load data');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleToggleSeller = (sellerId: number) => {
    setSelectedSellers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sellerId)) {
        newSet.delete(sellerId);
      } else {
        newSet.add(sellerId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedSellers.size === filteredAvailableSellers.length) {
      setSelectedSellers(new Set());
    } else {
      setSelectedSellers(new Set(filteredAvailableSellers.map(s => s.id)));
    }
  };

  const handleSave = async () => {
    if (!salesman) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await salesmanService.assignSellers(user?.id!, {
          salesmanId: salesman.id,
          sellerIds: Array.from(selectedSellers),
        });
        
        setSuccess('Sellers assigned successfully!');
        
        // Reload data to show updated assignments
        const assigned = await salesmanService.getAssignedSellers(user?.id!, salesman.id);
        setAssignedSellers(Array.isArray(assigned) ? assigned : []);
        
        // Refresh available sellers
        const available = await salesmanService.getAvailableSellers(user?.id!);
        setAvailableSellers(Array.isArray(available) ? available : []);
        
      } catch (err: any) {
        setError(err?.message ?? 'Failed to assign sellers');
      } finally {
        setSaving(false);
      }
    });
  };

  const filteredAvailableSellers = useMemo(() => {
    const sellers = Array.isArray(availableSellers) ? availableSellers : [];
    return sellers.filter(seller =>
      seller?.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller?.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller?.phone?.includes(searchTerm)
    );
  }, [availableSellers, searchTerm]);

  const safeAssignedSellers = Array.isArray(assignedSellers) ? assignedSellers : [];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !salesman) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/wholesaler/salesmen/${id}`)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Salesman Details
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Assign Sellers</h1>
      </div>

      {/* Salesman Info Card */}
      {salesman && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{salesman.fullName}</h2>
              <p className="text-sm text-slate-500">{salesman.employeeId} · {salesman.region}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-slate-500">Currently Assigned</p>
              <p className="text-2xl font-bold text-blue-600">{safeAssignedSellers.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Search and Select All */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sellers by shop name, owner, or phone..."
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSelectAll}
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          {selectedSellers.size === filteredAvailableSellers.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Available Sellers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAvailableSellers.map((seller) => {
          if (!seller || !seller.id) return null;
          
          const isSelected = selectedSellers.has(seller.id);
          const isAssigned = safeAssignedSellers.some(a => a?.sellerId === seller.id);

          return (
            <div
              key={seller.id}
              onClick={() => handleToggleSeller(seller.id)}
              className={`cursor-pointer rounded-lg border p-4 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
              } ${isAssigned ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-slate-100 p-2">
                    <Store className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{seller.shopName}</h3>
                    <p className="text-sm text-slate-600">{seller.ownerName}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="h-3 w-3" />
                        {seller.phone}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {seller.address}
                      </div>
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                )}
                {isAssigned && !isSelected && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Assigned
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredAvailableSellers.length === 0 && (
          <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <Store className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">No sellers available</h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchTerm 
                ? 'No sellers match your search criteria'
                : 'All sellers are already assigned'}
            </p>
          </div>
        )}
      </div>

      {/* Selection Summary and Save Button */}
      <div className="sticky bottom-0 mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-blue-600">{selectedSellers.size}</span> sellers selected
            </p>
            <p className="text-xs text-slate-500">
              {safeAssignedSellers.length} currently assigned
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Assignments
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
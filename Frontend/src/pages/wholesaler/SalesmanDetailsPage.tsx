import { useState, useEffect, useTransition } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  CreditCard,
  Users,
  Edit,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { salesmanService } from '../../services/salesmanService';
import { StatusBadge } from './components/order/StatusBadge'; 
import type { Salesman } from '../../types/wholesalerSalesman';

export function SalesmanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salesman, setSalesman] = useState<Salesman | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user?.id && id) {
      fetchSalesman();
    }
  }, [user?.id, id]);

  const fetchSalesman = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const data = await salesmanService.getSalesman(user?.id!, parseInt(id!));
        setSalesman(data);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load salesman details');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleToggleStatus = async () => {
    if (!salesman) return;
    
    try {
      await salesmanService.toggleStatus(
        user?.id!,
        salesman.id,
        salesman.status === 'INACTIVE'
      );
      fetchSalesman();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !salesman) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error || 'Salesman not found'}</span>
        </div>
      </div>
    );
  }
  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/wholesaler/salesmen')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Salesmen
        </button>
        <button
          onClick={() => navigate(`/wholesaler/salesmen/${salesman.id}/edit`)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700"
        >
          <Edit className="h-4 w-4" />
          Edit Salesman
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{salesman.fullName}</h1>
                <p className="text-sm text-slate-500">{salesman.employeeId}</p>
              </div>
            </div>
            <StatusBadge status={salesman.status} />
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{salesman.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{salesman.phone}</span>
                </div>
              </div>

              <h3 className="mt-6 font-semibold text-slate-900">Work Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{salesman.region}</span>
                </div>
                {salesman.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{salesman.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    {salesman.assignedSellersCount} sellers assigned
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Financial Details</h3>
              <div className="space-y-3">
                {salesman.commissionRate && (
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      Commission: {salesman.commissionRate}%
                    </span>
                  </div>
                )}
                {salesman.salary && (
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      Salary: ₹{salesman.salary.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">
                    Joined: {new Date(salesman.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3 border-t border-slate-200 pt-6">
            <button
              onClick={() => navigate(`/wholesaler/salesmen/${salesman.id}/assign`)}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Assign Sellers
            </button>
            <button
              onClick={handleToggleStatus}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${
                salesman.status === 'ACTIVE'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {salesman.status === 'ACTIVE' ? 'Deactivate Salesman' : 'Activate Salesman'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { salesmanService } from '../../services/salesmanService';
import { AssignmentsTable } from './components/salesman/AssignmentsTable'; 
import { Loader2, AlertCircle } from 'lucide-react';
import type { SalesmanAssignment } from '../../types/wholesalerSalesman';

export function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<SalesmanAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await salesmanService.getAllAssignments(user?.id!);
      setAssignments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (assignmentId: number) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    
    try {
      await salesmanService.removeAssignment(user?.id!, assignmentId);
      await loadAssignments(); // Refresh list
    } catch (err: any) {
      alert(err.message || 'Failed to remove assignment');
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadAssignments();
    }
  }, [user?.id]);

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
        <h1 className="text-2xl font-bold text-slate-900">All Assignments</h1>
        <p className="text-sm text-slate-500">
          Total: {assignments.length} assignments
        </p>
      </div>
      
      <AssignmentsTable 
        assignments={assignments} 
        onRemove={handleRemove} 
      />
      
      {assignments.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-500">No assignments found</p>
        </div>
      )}
    </div>
  );
}
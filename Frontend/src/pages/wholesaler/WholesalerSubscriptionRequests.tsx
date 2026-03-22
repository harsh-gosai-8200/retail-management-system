import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface SubscriptionRequest {
  id: number;
  localSellerId: number;
  localSellerName: string;
  localSellerShop: string;
  wholesalerId: number;
  wholesalerName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  message?: string;
}

interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
}

export function WholesalerSubscriptionRequests() {
  const { user } = useAuth();
  const wholesalerId = user?.role === "WHOLESALER" ? user?.id : null;

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<
    SubscriptionRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<Record<number, boolean>>({});

  const loadRequests = useCallback(async () => {
    if (!wholesalerId) return;

    try {
      setLoading(true);
      setError(null);
      const response: SpringPage<SubscriptionRequest> =
        await api.getPendingSubscriptionRequests(wholesalerId);
      setRequests(response.content || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [wholesalerId]);

  const loadApprovedRequests = useCallback(async () => {
    if (!wholesalerId) return;

    try {
      const response: SpringPage<SubscriptionRequest> =
        await api.getActiveSubscriptionRequests(wholesalerId);
      setApprovedRequests(response.content || []);
    } catch (err: unknown) {
      console.error("Failed to load approved requests:", err);
    }
  }, [wholesalerId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    loadApprovedRequests();
  }, [loadApprovedRequests]);

  const handleApprove = async (request: SubscriptionRequest) => {
    setProcessing((prev) => ({ ...prev, [request.id]: true }));
    try {
      await api.approveSubscription(request.id);
      // Remove from pending
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      // Add to approved
      setApprovedRequests((prev) => [...prev, request]);
    } catch (err: unknown) {
      console.error("Failed to approve subscription:", err);
    } finally {
      setProcessing((prev) => ({ ...prev, [request.id]: false }));
    }
  };

  const handleReject = async (request: SubscriptionRequest) => {
    setProcessing((prev) => ({ ...prev, [request.id]: true }));
    try {
      await api.rejectSubscription(request.id);
      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (err: unknown) {
      console.error("Failed to reject subscription:", err);
    } finally {
      setProcessing((prev) => ({ ...prev, [request.id]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 animate-pulse text-slate-400" />
          <p className="text-slate-600">Loading subscription requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800">{error}</p>
        <Button onClick={loadRequests} className="mt-4" variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Subscription Requests
        </h1>
        <p className="text-sm text-slate-500">
          Manage pending subscription requests from local sellers.
        </p>
      </header>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="font-medium text-slate-900">No pending requests</p>
          <p className="text-sm text-slate-500">
            All subscription requests have been processed.
          </p>
        </div>
      ) : (
        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Seller Name</th>
                <th className="px-4 py-3 font-medium">Shop Name</th>
                <th className="px-4 py-3 font-medium">Request Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b last:border-b-0 hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {request.localSellerName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {request.localSellerShop || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-4 py-3 flex justify-end gap-2">
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={processing[request.id]}
                      size="sm"
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {processing[request.id] ? "Processing..." : "Accept"}
                    </Button>
                    <Button
                      onClick={() => handleReject(request)}
                      disabled={processing[request.id]}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      {processing[request.id] ? "Processing..." : "Reject"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Approved Local Sellers Section */}
      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Approved Local Sellers
          </h2>
          <p className="text-sm text-slate-500">
            Sellers with active subscriptions to your products.
          </p>
        </header>
        {approvedRequests.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="font-medium text-slate-900">No approved sellers</p>
            <p className="text-sm text-slate-500">
              Approved sellers will appear here once you accept their
              subscription requests.
            </p>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Seller Name</th>
                <th className="px-4 py-3 font-medium">Shop Name</th>
              </tr>
            </thead>
            <tbody>
              {approvedRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b last:border-b-0 hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {request.localSellerName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {request.localSellerShop || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

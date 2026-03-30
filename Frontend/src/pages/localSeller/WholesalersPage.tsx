
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Loader2, Repeat, UserPlus, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";


type SubscriptionStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "INACTIVE";

interface Wholesaler {
  id: number;
  username: string;
  businessName: string;
}

export function WholesalersPage() {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [statuses, setStatuses] = useState<Record<number, SubscriptionStatus>>({});
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const sellerId = user?.id;
  const sellerCity = user?.city;

  useEffect(() => {
    loadWholesalers();
  }, []);

  useEffect(() => {
    if (sellerId && wholesalers.length > 0) {
      loadStatuses();
    }
  }, [sellerId, wholesalers]);

  async function loadWholesalers() {
    try {
      const data = await api.getWholesalers(sellerCity);
      setWholesalers(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadStatuses() {
    if (!sellerId) return;
    try {
      const statusMap: Record<number, SubscriptionStatus> = {};
      await Promise.all(
        wholesalers.map(async (w) => {
          if (!w.id) return;
          try {
            const res = await api.getSubscriptionStatus(sellerId, w.id);
            statusMap[w.id] = res.status || "NONE";
          } catch {
            statusMap[w.id] = "NONE";
          }
        })
      );
      setStatuses(statusMap);
    } catch (err: any) {
      console.error("Failed to load statuses:", err.message);
    }
  }

  async function handleSubscribe(id: number) {
    if (!sellerId) return;
    const prevStatus = statuses[id];
    setStatuses((prev) => ({ ...prev, [id]: "PENDING" }));
    try {
      await api.subscribeWholesaler(sellerId, id);

    } catch (err: any) {
      console.error(err.message);
      setStatuses((prev) => ({ ...prev, [id]: prevStatus }));
    }
  }

  async function handleCancel(id: number) {
    if (!sellerId) return;
    const prevStatus = statuses[id];
    setStatuses((prev) => ({ ...prev, [id]: "NONE" }));
    try {
      await api.cancelSubscription(sellerId, id);
    } catch (err: any) {
      console.error(err.message);
      setStatuses((prev) => ({ ...prev, [id]: prevStatus }));
    }
  }

  async function handleUnsubscribe(id: number) {
    if (!sellerId) return;
    const prevStatus = statuses[id];
    setStatuses((prev) => ({ ...prev, [id]: "INACTIVE" }));
    try {
      await api.unsubscribeWholesaler(sellerId, id);
    } catch (err: any) {
      console.error(err.message);
      setStatuses((prev) => ({ ...prev, [id]: prevStatus }));
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  function statusbar(status?: SubscriptionStatus) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "REJECTED":
      return "bg-red-50 text-red-600 border border-red-200";
    case "INACTIVE":
      return "bg-slate-100 text-slate-600 border border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">
          Wholesalers
        </h1>
        <p className="text-sm text-slate-500">
          Browse and manage your subscriptions.
        </p>
      </header>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Wholesaler</th>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {wholesalers.map((w) => (
              <tr
                key={w.id}
                className="border-b last:border-b-0 hover:bg-slate-50/70 transition"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {w.username}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {w.businessName}
                </td>

                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusbar(statuses[w.id])}`}>
                    {statuses[w.id] || "NONE"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/local-seller/wholesaler/${w.id}`}
                      className="flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                    >
                      View
                    </Link>

                    {/* Buttons same logic but cleaner */}
                    {(!statuses[w.id] || statuses[w.id] === "NONE") && (
                      <button
                        onClick={() => handleSubscribe(w.id)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                      >
                        Subscribe
                      </button>
                    )}

                    {statuses[w.id] === "PENDING" && (
                      <>
                        <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-700">
                          Pending
                        </span>
                        <button
                          onClick={() => handleCancel(w.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {statuses[w.id] === "APPROVED" && (
                      <>
                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                          Subscribed
                        </span>
                        <button
                          onClick={() => handleUnsubscribe(w.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                        >
                          Unsubscribe
                        </button>
                      </>
                    )}

                    {(statuses[w.id] === "REJECTED" ||
                      statuses[w.id] === "INACTIVE") && (
                      <button
                        onClick={() => handleSubscribe(w.id)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}


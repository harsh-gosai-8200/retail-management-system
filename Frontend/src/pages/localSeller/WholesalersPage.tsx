
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
      const data = await api.getWholesalers();
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
          const res = await api.getSubscriptionStatus(sellerId, w.id);
          statusMap[w.id] = res.status || "NONE";
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Available Wholesalers</h1>
        <p className="text-sm text-slate-500">Browse and subscribe to wholesalers.</p>
      </header>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Business Name</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {wholesalers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  No wholesalers found
                </td>
              </tr>
            ) : (
              wholesalers.map((w) => (
                <tr
                  key={w.id}
                  className="border-b last:border-b-0 hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{w.username}</td>
                  <td className="px-4 py-3 text-slate-600">{w.businessName}</td>
                  <td className="px-4 py-3 flex justify-end items-center gap-2">
  {/* View Products always visible */}
  <Link
    to={`/local-seller/wholesaler/${w.id}`}
    className="text-blue-600 text-sm font-medium hover:underline"
  >
    View Products
  </Link>

  {/* NOT SUBSCRIBED */}
  {(!statuses[w.id] || statuses[w.id] === "NONE") && (
    <button
      onClick={() => handleSubscribe(w.id)}
      className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/30 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50/50 transition"
    >
      <UserPlus className="h-4 w-4" />
      Subscribe
    </button>
  )}

  {/* PENDING */}
  {statuses[w.id] === "PENDING" && (
    <>
      <button
        disabled
        className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/20 px-3 py-1.5 text-sm text-amber-600 cursor-not-allowed opacity-80"
      >
        <Clock className="h-4 w-4" />
        Pending
      </button>

      <button
        onClick={() => handleCancel(w.id)}
        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/20 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50/30 transition"
      >
        <XCircle className="h-4 w-4" />
        Cancel
      </button>
    </>
  )}

  {/* APPROVED */}
  {statuses[w.id] === "APPROVED" &&  (
    <>
      <button
        disabled
        className="flex items-center gap-1 rounded-lg border border-green-200 bg-green-50/20 px-3 py-1.5 text-sm text-green-600 cursor-not-allowed opacity-80"
      >
        <CheckCircle2 className="h-4 w-4" />
        Subscribed
      </button>

      <button
        onClick={() => handleUnsubscribe(w.id)}
        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/20 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50/30 transition"
      >
        <XCircle className="h-4 w-4" />
        Unsubscribe
      </button>
    </>
  )}

  {/* REJECTED / INACTIVE */}
  {(statuses[w.id] === "REJECTED" || statuses[w.id] === "INACTIVE") && (
    <button
      onClick={() => handleSubscribe(w.id)}
      className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/30 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50/50 transition"
    >
      <Repeat className="h-4 w-4" />
      Subscribe Again
    </button>
  )}
</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}


import { useEffect, useState, useCallback } from "react";
import {
  Store,
  Package,
  AlertCircle,
  ArrowRight,
  Loader2,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type Tone = "blue" | "amber" | "green" | "red";

const toneMap: Record<Tone, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  red: "border-red-200 bg-red-50 text-red-700",
};

function StatCard({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string;
  value: number | string | React.ReactNode;
  helper: string;
  icon: React.ReactNode;
  tone: Tone;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>

        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${toneMap[tone]}`}
        >
          {icon}
        </span>
      </div>
    </article>
  );
}

export function LocalSellerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sellerId = user?.id;

  const [wholesalers, setWholesalers] = useState<any[]>([]);
  const [subscribed, setSubscribed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalWholesalers: 0,
    totalSubscribed: 0,
    pendingSubscriptions: 0,
  });
  const [lastSubscriptionStatus, setLastSubscriptionStatus] = useState<
    Record<number, string>
  >({});

  // Use useCallback to ensure stable function reference
  const loadData = useCallback(async () => {
    if (!sellerId) return;

    try {
      if (!user) return;
      setLoading(true);
      setError(null);

      // Load all wholesalers
      const allWholesalers = (await api.getWholesalers()) || [];
      setWholesalers(allWholesalers);

      // Load subscribed wholesalers safely
      const subscribedRaw = await api.getSubscribedWholesalers(sellerId);

      const subscribedWholesalers = subscribedRaw?.content || [];
      setSubscribed(subscribedWholesalers);

      const pendingCount = subscribedWholesalers.filter(
        (w: { status: string }) => w.status?.toUpperCase() === "PENDING",
      ).length;

      const approvedCount = subscribedWholesalers.filter(
        (w: { status: string }) => w.status?.toUpperCase() === "APPROVED",
      ).length;

      const statusMap: Record<number, string> = {};
      subscribedWholesalers.forEach((w: any) => {
        statusMap[w.wholesalerId] = w.status;
      });

      if (Object.keys(lastSubscriptionStatus).length > 0) {
        const updates: string[] = [];

        subscribedWholesalers.forEach((w: any) => {
          const previous = lastSubscriptionStatus[w.wholesalerId];
          const current = w.status;

          if (previous === "PENDING" && current === "APPROVED") {
            updates.push(
              `Subscription approved for wholesaler ${w.wholesalerName || w.wholesalerId}`,
            );
          }

          if (previous === "PENDING" && current === "REJECTED") {
            updates.push(
              `Subscription rejected for wholesaler ${w.wholesalerName || w.wholesalerId}`,
            );
          }
        });

        if (updates.length > 0) {
          setNotifications((prev) => [...updates, ...prev]);
        }
      }

      setLastSubscriptionStatus(statusMap);

      setStats({
        totalWholesalers: allWholesalers.length,
        totalSubscribed: approvedCount,
        pendingSubscriptions: pendingCount,
      });
    } catch (err: any) {
      console.error("Subscription load failed:", err);
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  // Load data when user is ready
  useEffect(() => {
    if (!sellerId) return;
    loadData();
  }, [sellerId, loadData]);

  // Reload on window focus (optional, prevents blank page on tab switch)
  useEffect(() => {
    const handleFocus = () => loadData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadData]);

  // Poll subscription status every 30s
  useEffect(() => {
    if (!sellerId) return;
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [sellerId, loadData]);

  const statCards = [
    {
      label: "Total Wholesalers",
      value: stats.totalWholesalers,
      icon: Store,
      color: "bg-blue-50 text-blue-600",
      helper: "Available to connect",
    },
    {
      label: "Subscribed",
      value: stats.totalSubscribed,
      icon: Store,
      color: "bg-green-50 text-green-600",
      helper: "Active connections",
    },
    {
      label: "Pending",
      value: stats.pendingSubscriptions,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
      helper: "Awaiting approval",
    },
    {
      label: "Orders",
      value: 0,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
      helper: "Coming soon",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-red-600">
        <AlertCircle className="h-5 w-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p>Welcome back, {user?.username || "Local Seller"}!</p>

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((note, index) => (
            <div
              key={index}
              className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
            >
              {note}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{card.helper}</p>
              </div>
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          onClick={() => navigate("/local-seller/wholesalers")}
          className="group rounded-lg border bg-white p-6 text-left shadow-sm hover:border-blue-300 hover:shadow-md"
        >
          <Store className="h-8 w-8 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Browse Wholesalers
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Discover and subscribe to wholesalers
          </p>
          <ArrowRight className="mt-4 h-5 w-5 text-slate-400 group-hover:text-blue-600" />
        </button>

        <button
          onClick={() => navigate("/local-seller/subscriptions")}
          className="group rounded-lg border bg-white p-6 text-left shadow-sm hover:border-blue-300 hover:shadow-md"
        >
          <Package className="h-8 w-8 text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            My Subscriptions
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            View your subscribed wholesalers
          </p>
          <ArrowRight className="mt-4 h-5 w-5 text-slate-400 group-hover:text-blue-600" />
        </button>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Recent Wholesalers
        </h2>
        <div className="mt-4 space-y-3">
          {wholesalers.slice(0, 3).map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {w.businessName || w.name}
                </p>
                <p className="text-xs text-slate-500">{w.email}</p>
              </div>
              <Link
                to={`/local-seller/wholesalers`}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                View wholesaler
              </Link>
            </div>
          ))}
          {wholesalers.length === 0 && (
            <p className="text-sm text-slate-500">No wholesalers available</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Store, Package, Clock3, TrendingUp } from "lucide-react";
import { api } from "../../services/api";

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
  value: number | string;
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
  const [wholesalers, setWholesalers] = useState<any[]>([]);
  const [loadingWholesalers, setLoadingWholesalers] = useState(false);
  const [wholesalersError, setWholesalersError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadWholesalers = async () => {
      setLoadingWholesalers(true);
      setWholesalersError(null);

      try {
        const data = await api.getWholesalers();
        if (!active) return;
        setWholesalers(data || []);
      } catch (error: any) {
        if (!active) return;
        setWholesalersError(error?.message ?? "Failed to load wholesalers.");
      } finally {
        if (active) setLoadingWholesalers(false);
      }
    };

    loadWholesalers();

    return () => {
      active = false;
    };
  }, []);

  const totalWholesalers = wholesalers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of your orders and wholesalers.
        </p>
      </header>

      {/* Stats Section */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Wholesalers"
          value={
            loadingWholesalers
              ? "Loading..."
              : wholesalersError
                ? "—"
                : totalWholesalers
          }
          helper={
            wholesalersError
              ? `Failed to load wholesalers: ${wholesalersError}`
              : "Registered wholesalers available"
          }
          icon={<Store className="h-5 w-5" />}
          tone="blue"
        />

        <StatCard
          label="Total Orders"
          value={8}
          helper="Orders placed by you"
          icon={<Package className="h-5 w-5" />}
          tone="green"
        />

        <StatCard
          label="Pending Orders"
          value={3}
          helper="Awaiting confirmation"
          icon={<Clock3 className="h-5 w-5" />}
          tone="amber"
        />

        <StatCard
          label="Total Spending"
          value="₹25,000"
          helper="Overall purchase value"
          icon={<TrendingUp className="h-5 w-5" />}
          tone="red"
        />
      </section>

      {/* Wholesaler Preview */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Available Wholesalers
        </h2>

        {loadingWholesalers ? (
          <p className="mt-2 text-sm text-slate-500">Loading wholesalers...</p>
        ) : wholesalersError ? (
          <p className="mt-2 text-sm text-red-500">{wholesalersError}</p>
        ) : wholesalers.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No wholesalers found.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {wholesalers.slice(0, 5).map((w: any, idx: number) => (
              <li
                key={w.id ?? w.email ?? w.shopName ?? w.businessName ?? idx}
                className="rounded-md bg-slate-50 p-3"
              >
                <p className="text-sm font-medium text-slate-900">
                  {w.name ||
                    w.businessName ||
                    w.shopName ||
                    `Wholesaler #${w.id}`}
                </p>
                <p className="text-xs text-slate-500">
                  {w.email || w.location || ""}
                </p>
              </li>
            ))}
            {wholesalers.length > 5 && (
              <li className="text-xs text-slate-500">
                +{wholesalers.length - 5} more wholesalers
              </li>
            )}
          </ul>
        )}
      </section>

      {/* Placeholder Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
        <p className="mt-2 text-sm text-slate-500">
          Order history will appear here once implemented.
        </p>
      </section>
    </div>
  );
}

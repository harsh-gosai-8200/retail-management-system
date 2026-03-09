import {
  Store,
  Package,
  Clock3,
  TrendingUp,
} from "lucide-react";

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
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>
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
          value={12}
          helper="Registered wholesalers available"
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

      {/* Placeholder Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Recent Orders
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Order history will appear here once implemented.
        </p>
      </section>
    </div>
  );
}
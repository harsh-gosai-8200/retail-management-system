import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

export function WholesalersPage() {
  const { user } = useAuth();
  const sellerId = user?.id;

  const [wholesalers, setWholesalers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWholesalers();
  }, []);

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

  async function subscribe(wholesalerId: number) {
    if (!sellerId) return;

    await api.subscribeWholesaler(sellerId, wholesalerId);
    alert("Subscription request sent");
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        Loading wholesalers...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Available Wholesalers
        </h1>
        <p className="text-sm text-slate-500">
          Browse and subscribe to wholesalers.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Business Name</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {wholesalers.map((w) => (
              <tr
                key={w.id}
                className="border-b last:border-none hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-slate-900">
                  {w.username}
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {w.businessName}
                </td>

                <td className="px-4 py-3 text-right space-x-2">
                  <Link
                    to={`/local-seller/wholesalers/${w.id}`}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    View
                  </Link>

                  <Button
                    size="sm"
                    onClick={() => subscribe(w.id)}
                  >
                    Subscribe
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
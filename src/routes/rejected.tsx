import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useFilteredAccounts } from "@/lib/store";
import { KpiCard } from "@/components/dashboard-utils";
import { RepChip } from "@/components/dashboard-utils";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const Route = createFileRoute("/rejected")({
  head: () => ({
    meta: [
      { title: "Rejected Accounts — Storefries Sales" },
      { name: "description", content: "Analyze why leads were lost — by industry, rep, and reason." },
    ],
  }),
  component: RejectedPage,
});

function RejectedPage() {
  const all = useFilteredAccounts();
  const rejected = all.filter((a) => a.status === "rejected");

  const byIndustry = useMemo(() => {
    const m = new Map<string, number>();
    rejected.forEach((a) => m.set(a.industry, (m.get(a.industry) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [rejected]);

  const byOwner = useMemo(() => {
    const m = new Map<string, number>();
    rejected.forEach((a) => m.set(a.owner, (m.get(a.owner) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [rejected]);

  const topReason = useMemo(() => {
    const m = new Map<string, number>();
    rejected.forEach((a) => { if (a.reason) m.set(a.reason, (m.get(a.reason) ?? 0) + 1); });
    const top = Array.from(m.entries()).sort((a, b) => b[1] - a[1])[0];
    return top?.[0] ?? "—";
  }, [rejected]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rejected Accounts</h1>
        <p className="text-sm text-muted-foreground">Analyze lost leads to refine outbound strategy.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total Rejections" value={rejected.length} accent="text-rose-600" />
        <KpiCard label="Top Industry" value={byIndustry[0]?.[0] ?? "—"} sub={byIndustry[0] ? `${byIndustry[0][1]} accounts` : ""} />
        <KpiCard label="Top Reason" value={topReason.length > 30 ? topReason.slice(0, 30) + "…" : topReason} />
        <KpiCard label="Rejection Rate" value={`${all.length ? Math.round((rejected.length / all.length) * 1000) / 10 : 0}%`} accent="text-gradient-brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-lg font-semibold">Rejections by Industry</h2>
          <div className="h-72">
            <Bar
              data={{
                labels: byIndustry.map((b) => b[0]),
                datasets: [{ label: "Rejected", data: byIndustry.map((b) => b[1]), backgroundColor: "#f43f5e", borderRadius: 6 }],
              }}
              options={{ indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </section>
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-lg font-semibold">Rejections by Owner</h2>
          <ul className="space-y-3">
            {byOwner.map(([owner, count]) => (
              <li key={owner} className="flex items-center gap-3">
                <RepChip name={owner} />
                <div className="ml-auto h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-rose-400" style={{ width: `${(count / Math.max(...byOwner.map((b) => b[1]))) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-semibold">{count}</span>
              </li>
            ))}
            {byOwner.length === 0 && <li className="text-sm text-muted-foreground">No rejections.</li>}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border bg-card shadow-card overflow-hidden">
        <header className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Detailed Rejected Accounts</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Industry</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Month</th>
                <th className="text-left px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {rejected.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2.5 font-medium">{a.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{a.industry}</td>
                  <td className="px-4 py-2.5"><RepChip name={a.owner} /></td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{a.month}</td>
                  <td className="px-4 py-2.5 text-xs">{a.reason ?? "—"}</td>
                </tr>
              ))}
              {rejected.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No rejected accounts.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore, useFilteredAccounts } from "@/lib/store";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,
} from "chart.js";
import { computeMetrics, KpiCard } from "@/components/dashboard-utils";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Storefries Sales" },
      { name: "description", content: "Industry distribution, rep performance, and month comparison." },
    ],
  }),
  component: AnalyticsPage,
});

const STATUS_COLORS: Record<string, string> = {
  prospect: "#94a3b8", demo: "#0073c8", trial: "#f59e0b", rejected: "#f43f5e",
};

function AnalyticsPage() {
  const accounts = useFilteredAccounts();
  const allAccounts = useStore((s) => s.accounts);
  const reps = useStore((s) => s.reps);

  const byIndustry = useMemo(() => {
    const m = new Map<string, number>();
    accounts.forEach((a) => m.set(a.industry, (m.get(a.industry) ?? 0) + 1));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [accounts]);

  const repBreakdown = useMemo(() => {
    return reps.map((r) => {
      const list = accounts.filter((a) => a.owner === r.name);
      return { name: r.name, ...computeMetrics(list) };
    });
  }, [reps, accounts]);

  const monthCompare = useMemo(() => {
    const months = Array.from(new Set(allAccounts.map((a) => a.month)));
    return months.map((m) => {
      const list = allAccounts.filter((a) => a.month === m);
      return { month: m, ...computeMetrics(list) };
    });
  }, [allAccounts]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics Insights</h1>
        <p className="text-sm text-muted-foreground">Deeper view of pipeline, industry, and rep performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Industries Covered" value={byIndustry.length} accent="text-gradient-brand" />
        <KpiCard label="Total Reps" value={reps.length} />
        <KpiCard label="Months Tracked" value={monthCompare.length} />
        <KpiCard label="Pipeline Volume" value={accounts.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-lg font-semibold">Industry Distribution</h2>
          <div className="h-80">
            <Doughnut
              data={{
                labels: byIndustry.map((b) => b[0]),
                datasets: [{
                  data: byIndustry.map((b) => b[1]),
                  backgroundColor: ["#0073c8", "#88bf74", "#f59e0b", "#f43f5e", "#8b5cf6", "#14b8a6", "#ec4899", "#06b6d4", "#84cc16", "#eab308", "#a855f7", "#ef4444", "#10b981", "#3b82f6", "#f97316", "#6366f1", "#22c55e"],
                  borderWidth: 2, borderColor: "#fff",
                }],
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { boxWidth: 10, font: { size: 10 } } } } }}
            />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-card">
          <h2 className="mb-3 text-lg font-semibold">Rep Performance (stacked)</h2>
          <div className="h-80">
            <Bar
              data={{
                labels: repBreakdown.map((r) => r.name),
                datasets: [
                  { label: "Prospect", data: repBreakdown.map((r) => r.prospect), backgroundColor: STATUS_COLORS.prospect },
                  { label: "Demo", data: repBreakdown.map((r) => r.demo), backgroundColor: STATUS_COLORS.demo },
                  { label: "Trial", data: repBreakdown.map((r) => r.trial), backgroundColor: STATUS_COLORS.trial },
                  { label: "Rejected", data: repBreakdown.map((r) => r.rejected), backgroundColor: STATUS_COLORS.rejected },
                ],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </section>
      </div>

      <section className="rounded-xl border bg-card p-5 shadow-card">
        <h2 className="mb-3 text-lg font-semibold">Month-over-Month Comparison</h2>
        <div className="h-72">
          <Bar
            data={{
              labels: monthCompare.map((m) => m.month),
              datasets: [
                { label: "Prospect", data: monthCompare.map((m) => m.prospect), backgroundColor: STATUS_COLORS.prospect },
                { label: "Demo", data: monthCompare.map((m) => m.demo), backgroundColor: STATUS_COLORS.demo },
                { label: "Trial", data: monthCompare.map((m) => m.trial), backgroundColor: STATUS_COLORS.trial },
                { label: "Rejected", data: monthCompare.map((m) => m.rejected), backgroundColor: STATUS_COLORS.rejected },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
          />
        </div>
      </section>
    </div>
  );
}

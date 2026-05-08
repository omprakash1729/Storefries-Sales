import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useFilteredAccounts, useStore } from "@/lib/store";
import { KpiCard, useMetrics, RepAvatar, RepChip, computeMetrics } from "@/components/dashboard-utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Storefries Sales" },
      { name: "description", content: "Cold calling sales pipeline overview, KPIs, funnel and rep performance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const m = useMetrics();
  const accounts = useFilteredAccounts();
  const reps = useStore((s) => s.reps);
  const globalMonth = useStore((s) => s.globalMonth);

  const repStats = useMemo(() => {
    return reps
      .map((r) => {
        const list = accounts.filter((a) => a.owner === r.name);
        const stats = computeMetrics(list);
        return { rep: r, ...stats };
      })
      .sort((a, b) => b.total - a.total);
  }, [reps, accounts]);

  const byIndustry = useMemo(() => {
    const map = new Map<string, typeof accounts>();
    for (const a of accounts) {
      if (!map.has(a.industry)) map.set(a.industry, []);
      map.get(a.industry)!.push(a);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [accounts]);

  const funnelData = {
    labels: ["Prospect", "Demo Attended", "Trial Started", "Rejected"],
    datasets: [{
      label: "Accounts",
      data: [m.prospect, m.demo, m.trial, m.rejected],
      backgroundColor: ["#94a3b8", "#0073c8", "#f59e0b", "#f43f5e"],
      borderRadius: 8,
      borderWidth: 0,
    }],
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Intelligence Hub</h1>
          <p className="text-sm text-muted-foreground">
            {globalMonth === "all" ? "All months" : globalMonth} · {m.total} accounts
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Total Accounts" value={m.total} sub="Active pipeline" accent="text-gradient-brand" progress={100} />
        <KpiCard label="Prospects" value={m.prospect} sub="In pipeline" progress={(m.prospect / Math.max(1, m.total)) * 100} />
        <KpiCard label="Demos" value={m.demo} sub="Demos attended" progress={(m.demo / Math.max(1, m.total)) * 100} />
        <KpiCard label="Trials" value={m.trial} sub="Trials started" progress={(m.trial / Math.max(1, m.total)) * 100} />
        <KpiCard label="Rejected" value={m.rejected} sub="Lost leads" progress={(m.rejected / Math.max(1, m.total)) * 100} />
        <KpiCard label="Conversion" value={`${m.conversion}%`} sub="Demo + Trial rate" accent="text-gradient-brand" progress={m.conversion} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel */}
        <section className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-card">
          <header className="mb-3">
            <h2 className="text-lg font-semibold">Conversion Funnel</h2>
            <p className="text-xs text-muted-foreground">Prospect → Demo → Trial · Rejected leakage</p>
          </header>
          <div className="h-72">
            <Bar
              data={funnelData}
              options={{
                indexAxis: "y" as const,
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, grid: { color: "#f1f5f9" } }, y: { grid: { display: false } } },
              }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { l: "Prospect", v: m.prospect, c: "bg-slate-400" },
              { l: "Demo", v: m.demo, c: "bg-sky-500" },
              { l: "Trial", v: m.trial, c: "bg-amber-500" },
              { l: "Rejected", v: m.rejected, c: "bg-rose-500" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
                <span className={`h-2 w-2 rounded-full ${s.c}`} />
                <span className="text-muted-foreground">{s.l}</span>
                <span className="ml-auto font-semibold">{s.v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Rep performance */}
        <section className="rounded-xl border bg-card p-5 shadow-card">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Rep Performance</h2>
          </header>
          <div className="space-y-4 max-h-[22rem] overflow-y-auto pr-1">
            {repStats.map(({ rep, total, demo, trial, rejected, conversion }) => (
              <div key={rep.name} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <RepAvatar name={rep.name} />
                  <div className="flex-1">
                    <div className="text-sm font-medium leading-tight">{rep.name}</div>
                    <div className="text-[11px] text-muted-foreground">{total} accounts · {demo} demo · {trial} trial · {rejected} rej</div>
                  </div>
                  <div className="text-sm font-bold text-gradient-brand">{conversion}%</div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(100, conversion * 2)}%` }} />
                </div>
              </div>
            ))}
            {repStats.length === 0 && <div className="text-sm text-muted-foreground">No reps yet.</div>}
          </div>
        </section>
      </div>

      {/* Industry analytics */}
      <section className="rounded-xl border bg-card p-5 shadow-card">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Industry Analytics</h2>
            <p className="text-xs text-muted-foreground">Accounts grouped by industry</p>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {byIndustry.map(([industry, list]) => (
            <div key={industry} className="rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold truncate">{industry}</h3>
                <span className="rounded-full bg-gradient-soft px-2 py-0.5 text-xs font-bold">{list.length}</span>
              </div>
              <ul className="mt-2 space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {list.slice(0, 50).map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate">{a.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <RepChip name={a.owner} />
                      <StatusBadge status={a.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useFilteredAccounts, useStore } from "@/lib/store";
import { KpiCard, useMetrics, RepAvatar, RepChip, RepAvatarMini, computeMetrics } from "@/components/dashboard-utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Bar } from "react-chartjs-2";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { groupAccountsByCompany, UniqueCompany } from "@/lib/crm-utils";
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

  const [selectedCompany, setSelectedCompany] = useState<UniqueCompany | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const uniqueCompanies = useMemo(() => {
    return groupAccountsByCompany(accounts);
  }, [accounts]);

  const filteredUniqueCompanies = useMemo(() => {
    if (statusFilter === "all") return uniqueCompanies;
    return uniqueCompanies.filter((uc) => uc.mostRecent.status === statusFilter);
  }, [uniqueCompanies, statusFilter]);

  const handleToggleFilter = (status: string) => {
    setStatusFilter((prev) => (prev === status ? "all" : status));
  };

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
    const map = new Map<string, UniqueCompany[]>();
    for (const uc of filteredUniqueCompanies) {
      if (!map.has(uc.industry)) map.set(uc.industry, []);
      map.get(uc.industry)!.push(uc);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filteredUniqueCompanies]);

  const funnelData = {
    labels: ["New Lead", "Prospect", "Demo Attended", "Proposal Sent", "Trial Started", "Rejected"],
    datasets: [{
      label: "Accounts",
      data: [m.new_lead, m.prospect, m.demo, m.proposal_sent, m.trial, m.rejected],
      backgroundColor: ["#8b5cf6", "#94a3b8", "#0073c8", "#10b981", "#f59e0b", "#f43f5e"],
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard label="Total Accounts" value={m.total} sub="Active pipeline" theme="indigo" onClick={() => setStatusFilter("all")} active={statusFilter === "all"} />
        <KpiCard label="New Leads" value={m.new_lead} sub="Initial outreach" theme="violet" progress={(m.new_lead / Math.max(1, m.total)) * 100} onClick={() => handleToggleFilter("new_lead")} active={statusFilter === "new_lead"} />
        <KpiCard label="Prospects" value={m.prospect} sub="In pipeline" theme="slate" progress={(m.prospect / Math.max(1, m.total)) * 100} onClick={() => handleToggleFilter("prospect")} active={statusFilter === "prospect"} />
        <KpiCard label="Demos" value={m.demo} sub="Demos attended" theme="blue" progress={(m.demo / Math.max(1, m.total)) * 100} onClick={() => handleToggleFilter("demo")} active={statusFilter === "demo"} />
        <KpiCard label="Proposals" value={m.proposal_sent} sub="Sent to client" theme="emerald" progress={(m.proposal_sent / Math.max(1, m.total)) * 100} onClick={() => handleToggleFilter("proposal_sent")} active={statusFilter === "proposal_sent"} />
        <KpiCard label="Trials" value={m.trial} sub="Trials started" theme="amber" progress={(m.trial / Math.max(1, m.total)) * 100} onClick={() => handleToggleFilter("trial")} active={statusFilter === "trial"} />
        <KpiCard label="Rejected" value={m.rejected} sub="Lost leads" theme="rose" progress={(m.rejected / Math.max(1, m.total)) * 100} onClick={() => handleToggleFilter("rejected")} active={statusFilter === "rejected"} />
        <KpiCard label="Conversion" value={`${m.conversion}%`} sub="Demo + Trial rate" theme="brand" progress={m.conversion} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel */}
        <section className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-card">
          <header className="mb-3">
            <h2 className="text-lg font-semibold">Conversion Funnel</h2>
            <p className="text-xs text-muted-foreground">New Lead → Prospect → Demo → Proposal → Trial · Rejected leakage</p>
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
      <section className="rounded-xl border border-slate-100/80 bg-card p-6 shadow-card">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              Industry Analytics
              {statusFilter !== "all" && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                  Showing {statusFilter}s
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground/90">Pipeline volume grouped by industry verticals</p>
          </div>
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")} className="text-xs font-semibold text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-lg transition">
              Reset Filter
            </button>
          )}
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {byIndustry.map(([industry, list]) => (
            <div key={industry} className="group rounded-xl border border-slate-100/80 bg-white p-3.5 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors" title={industry}>{industry}</h3>
                <span className="rounded-full bg-gradient-soft text-primary px-2 py-0.5 text-[10px] font-extrabold">{list.length}</span>
              </div>
              <ul className="mt-2.5 space-y-1 max-h-48 overflow-y-auto pr-1">
                {list.slice(0, 50).map((uc) => (
                  <li
                    key={uc.name}
                    onClick={() => setSelectedCompany(uc)}
                    className="flex items-center justify-between gap-2.5 text-xs py-1 px-1.5 rounded-lg hover:bg-indigo-50/50 cursor-pointer transition-colors duration-150 group/item"
                  >
                    <span className="font-semibold text-slate-700 truncate max-w-[130px] group-hover/item:text-primary" title={uc.name}>
                      {uc.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      <RepAvatarMini name={uc.mostRecent.owner} />
                      <StatusBadge status={uc.mostRecent.status} className="text-[9px] px-1.5 py-0" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Chronological Timeline History Modal */}
      <Dialog open={selectedCompany !== null} onOpenChange={(open) => !open && setSelectedCompany(null)}>
        <DialogContent className="max-w-lg rounded-2xl border border-slate-100 p-6 shadow-elevated bg-white">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-extrabold text-slate-800">{selectedCompany?.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Company profile and outbound interaction timeline
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-5">
            {/* Basic Info panel */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Industry Vertical</span>
                <span className="font-bold text-slate-800">{selectedCompany?.industry}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Current Assigned Owner</span>
                <span className="font-bold text-slate-800">{selectedCompany?.mostRecent.owner}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Current Status</span>
                {selectedCompany && <StatusBadge status={selectedCompany.mostRecent.status} className="mt-0.5" />}
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Last Interaction Month</span>
                <span className="font-bold text-slate-800">{selectedCompany?.mostRecent.month}</span>
              </div>
            </div>

            {/* Chronological Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-3">Interaction History</h4>
              <div className="relative pl-6 border-l border-slate-100 ml-3 space-y-5">
                {selectedCompany?.history.slice().reverse().map((h) => (
                  <div key={h.id} className="relative group/timeline">
                    {/* Circle Node */}
                    <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white border-2 border-primary/40 group-hover/timeline:border-primary transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-800">{h.month}</span>
                        <StatusBadge status={h.status} className="text-[9px] py-0 px-1.5" />
                        <span className="text-[10px] text-muted-foreground">by {h.owner}</span>
                      </div>
                      {h.reason && (
                        <p className="text-xs text-slate-500 bg-slate-50/40 border border-slate-100/30 p-2 rounded-lg italic mt-1 leading-relaxed">
                          "{h.reason}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

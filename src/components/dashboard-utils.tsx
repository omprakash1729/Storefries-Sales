import { useMemo } from "react";
import { useFilteredAccounts, useStore } from "@/lib/store";
import type { Account, AccountStatus } from "@/lib/types";
import { REP_COLOR_CLASS, REP_COLOR_SOFT } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

import { groupAccountsByCompany } from "@/lib/crm-utils";

export interface Metrics {
  total: number;
  new_lead: number;
  prospect: number;
  demo: number;
  proposal_sent: number;
  trial: number;
  rejected: number;
  conversion: number;
  active: number;
}

export function computeMetrics(accounts: Account[]): Metrics {
  // 💎 DEDUPLICATION ENGINE: Group entries by unique companies
  const uniqueGroups = groupAccountsByCompany(accounts);
  
  const m = { total: uniqueGroups.length, new_lead: 0, prospect: 0, demo: 0, proposal_sent: 0, trial: 0, rejected: 0, conversion: 0, active: 0 };
  
  for (const group of uniqueGroups) {
    // Collect unique set of statuses this company has achieved in the filtered range
    const distinctStatuses = new Set(group.history.map(h => h.status));
    
    // ⛔ EXCLUSIONARY RULE: If a company was ever rejected, it shouldn't inflate early-funnel counts like Prospect
    if (distinctStatuses.has("rejected")) {
      distinctStatuses.delete("prospect");
      distinctStatuses.delete("new_lead");
    }

    for (const s of distinctStatuses) {
      if (s in m) {
        m[s as keyof Metrics]++;
      }
    }
  }
  
  // Define Active as having passed through the funnel but not explicitly counting only final outcomes as rejection
  // Wait, let's follow historical total-rejected active math, just ensuring numbers reflect user count.
  m.active = m.total - m.rejected;
  
  // Formula uses total companies that touched Demo or Trial compared to population
  m.conversion = m.total === 0 ? 0 : Math.round(((m.demo + m.trial) / Math.max(1, m.total)) * 1000) / 10;
  return m;
}

export function useMetrics() {
  const accounts = useFilteredAccounts();
  return useMemo(() => computeMetrics(accounts), [accounts]);
}

export function KpiCard({
  label, value, sub, accent, progress, theme = "indigo", onClick, active
}: { label: string; value: string | number; sub?: string; accent?: string; progress?: number; theme?: "indigo" | "violet" | "slate" | "blue" | "teal" | "amber" | "rose" | "brand"; onClick?: () => void; active?: boolean }) {
  const themes = {
    teal: { border: "border-teal-100/60", bg: "bg-teal-50/20", glow: "shadow-[0_8px_30px_rgba(20,184,166,0.03)]", text: "text-teal-600", bar: "bg-teal-500", dot: "bg-teal-500" },
    violet: { border: "border-violet-100/60", bg: "bg-violet-50/20", glow: "shadow-[0_8px_30px_rgba(139,92,246,0.03)]", text: "text-violet-600", bar: "bg-violet-500", dot: "bg-violet-500" },
    indigo: { border: "border-indigo-100/60", bg: "bg-indigo-50/20", glow: "shadow-[0_8px_30px_rgba(99,102,241,0.03)]", text: "text-indigo-600", bar: "bg-indigo-500", dot: "bg-indigo-500" },
    slate: { border: "border-slate-100/80", bg: "bg-slate-50/20", glow: "shadow-[0_8px_30px_rgba(148,163,184,0.03)]", text: "text-slate-600", bar: "bg-slate-400", dot: "bg-slate-400" },
    blue: { border: "border-sky-100/60", bg: "bg-sky-50/20", glow: "shadow-[0_8px_30px_rgba(14,165,233,0.03)]", text: "text-sky-600", bar: "bg-sky-500", dot: "bg-sky-500" },
    amber: { border: "border-amber-100/60", bg: "bg-amber-50/20", glow: "shadow-[0_8px_30px_rgba(245,158,11,0.03)]", text: "text-amber-600", bar: "bg-amber-500", dot: "bg-amber-500" },
    rose: { border: "border-rose-100/60", bg: "bg-rose-50/20", glow: "shadow-[0_8px_30px_rgba(244,63,94,0.03)]", text: "text-rose-600", bar: "bg-rose-500", dot: "bg-rose-500" },
    brand: { border: "border-emerald-100/60", bg: "bg-emerald-50/20", glow: "shadow-[0_8px_30px_rgba(16,185,129,0.03)]", text: "text-gradient-brand", bar: "bg-gradient-brand", dot: "bg-emerald-500" },
  };

  const t = themes[theme] || themes.indigo;

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4 shadow-card transition-all duration-300 ${active ? "border-primary/80 ring-2 ring-primary bg-slate-50/40 scale-[1.01] shadow-elevated" : `${t.border} ${t.bg} ${t.glow}`} ${onClick ? "cursor-pointer hover:shadow-elevated hover:-translate-y-1 hover:scale-[1.01]" : "hover:shadow-elevated hover:-translate-y-1"}`}
    >
      <div className={`absolute top-0 left-0 h-[3px] w-full ${t.bar} opacity-70`} />
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{label}</div>
      </div>
      <div className={`mt-1.5 text-3xl font-extrabold tracking-tight ${accent ?? t.text}`}>{value}</div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground/80 font-medium">{sub}</div>}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${t.bar} transition-all duration-500`} style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
    </div>
  );
}

export function repInitials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function RepAvatarMini({ name }: { name: string }) {
  const reps = useStore((s) => s.reps);
  const rep = reps.find((r) => r.name === name);
  const cls = rep ? REP_COLOR_CLASS[rep.color] : "bg-slate-400";
  return (
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold text-white shadow-sm ring-1 ring-white/10 ${cls}`}
      title={name}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export function RepAvatar({ name }: { name: string }) {
  const reps = useStore((s) => s.reps);
  const rep = reps.find((r) => r.name === name);
  const cls = rep ? REP_COLOR_CLASS[rep.color] : "bg-slate-400";
  return (
    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${cls}`}>
      {repInitials(name)}
    </div>
  );
}

export function RepChip({ name }: { name: string }) {
  const reps = useStore((s) => s.reps);
  const rep = reps.find((r) => r.name === name);
  const cls = rep ? REP_COLOR_SOFT[rep.color] : "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${rep ? REP_COLOR_CLASS[rep.color] : "bg-slate-400"}`} />
      {name}
    </span>
  );
}

export { StatusBadge };
export type { AccountStatus };

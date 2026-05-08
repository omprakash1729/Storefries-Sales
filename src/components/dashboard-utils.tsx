import { useMemo } from "react";
import { useFilteredAccounts, useStore } from "@/lib/store";
import type { Account, AccountStatus } from "@/lib/types";
import { REP_COLOR_CLASS, REP_COLOR_SOFT } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export interface Metrics {
  total: number;
  prospect: number;
  demo: number;
  trial: number;
  rejected: number;
  conversion: number;
  active: number;
}

export function computeMetrics(accounts: Account[]): Metrics {
  const m = { total: accounts.length, prospect: 0, demo: 0, trial: 0, rejected: 0, conversion: 0, active: 0 };
  for (const a of accounts) m[a.status]++;
  m.active = m.total - m.rejected;
  m.conversion = m.total === 0 ? 0 : Math.round(((m.demo + m.trial) / m.total) * 1000) / 10;
  return m;
}

export function useMetrics() {
  const accounts = useFilteredAccounts();
  return useMemo(() => computeMetrics(accounts), [accounts]);
}

export function KpiCard({
  label, value, sub, accent, progress,
}: { label: string; value: string | number; sub?: string; accent?: string; progress?: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-card transition hover:shadow-elevated hover:-translate-y-0.5">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={"mt-1 text-3xl font-bold " + (accent ?? "text-foreground")}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
    </div>
  );
}

export function repInitials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
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

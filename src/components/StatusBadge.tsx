import type { AccountStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<AccountStatus, string> = {
  new_lead: "bg-violet-50 text-violet-600 border-violet-200/60",
  prospect: "bg-slate-50 text-slate-600 border-slate-200/60",
  demo: "bg-sky-50 text-sky-600 border-sky-200/60",
  trial: "bg-amber-50 text-amber-600 border-amber-200/60",
  rejected: "bg-rose-50 text-rose-600 border-rose-200/60",
};

const DOTS: Record<AccountStatus, string> = {
  new_lead: "bg-violet-500",
  prospect: "bg-slate-400",
  demo: "bg-sky-500",
  trial: "bg-amber-500",
  rejected: "bg-rose-500",
};

export function StatusBadge({ status, className }: { status: AccountStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide whitespace-nowrap shadow-xs transition-colors duration-200",
        STYLES[status],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", DOTS[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}

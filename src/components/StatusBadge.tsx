import type { AccountStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<AccountStatus, string> = {
  prospect: "bg-slate-100 text-slate-700 border-slate-200",
  demo: "bg-sky-100 text-sky-700 border-sky-200",
  trial: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

export function StatusBadge({ status, className }: { status: AccountStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STYLES[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

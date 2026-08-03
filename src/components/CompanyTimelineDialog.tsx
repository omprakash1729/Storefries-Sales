import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { groupAccountsByCompany } from "@/lib/crm-utils";
import { StatusBadge } from "@/components/StatusBadge";
import { CalendarIcon, Trash2, X, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function CompanyTimelineDialog() {
  const {
    accounts,
    deleteAccount,
    updateAccount,
    activeCompanyTimeline,
    setActiveCompanyTimeline,
    isEditMode,
  } = useStore();

  const activeCompany = useMemo(() => {
    if (!activeCompanyTimeline) return null;
    const allGrouped = groupAccountsByCompany(accounts);
    return allGrouped.find((c) => c.name === activeCompanyTimeline) || null;
  }, [accounts, activeCompanyTimeline]);

  const handleDeleteEntireCompany = (companyName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${companyName}" and all its interaction history? This cannot be undone.`,
      )
    )
      return;
    const targets = accounts.filter((a) => a.name === companyName);
    targets.forEach((t) => deleteAccount(t.id));
    setActiveCompanyTimeline(null);
    toast.success(`Permanently deleted ${companyName}`);
  };

  const handleToggleReminderClosed = (accountId: string, currentlyClosed: boolean) => {
    updateAccount(accountId, { reminderClosed: !currentlyClosed });
    toast.success(currentlyClosed ? "Reminder reopened" : "Reminder marked completed");
  };

  if (!activeCompany) return null;

  return (
    <Dialog
      open={activeCompanyTimeline !== null}
      onOpenChange={(open) => !open && setActiveCompanyTimeline(null)}
    >
      <DialogContent className="max-w-xl rounded-2xl border border-slate-100 p-6 shadow-elevated bg-white/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="pb-5 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-soft text-primary flex items-center justify-center font-black text-2xl border border-slate-100 shadow-sm shrink-0 select-none uppercase">
              {activeCompany.name.charAt(0)}
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5 capitalize">
                {activeCompany.name}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Account
                Activity & Timeline
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Modern Stats Panel */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/50">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Industry Vertical
              </span>
              <span className="block font-semibold text-slate-800 text-sm">
                {activeCompany.industry}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Assigned Owner
              </span>
              <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
                <div className="h-5 w-5 rounded-full bg-slate-200 text-[10px] flex items-center justify-center uppercase font-black">
                  {activeCompany.mostRecent.owner.charAt(0)}
                </div>
                {activeCompany.mostRecent.owner}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Current Pipeline State
              </span>
              <div className="pt-0.5">
                <StatusBadge
                  status={activeCompany.mostRecent.status}
                  className="scale-105 origin-left"
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Latest Milestone
              </span>
              <span className="block font-semibold text-slate-800 text-sm">
                {activeCompany.mostRecent.month}
              </span>
            </div>
          </div>

          {/* Upgraded Timeline */}
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <span className="h-px flex-1 bg-slate-100" /> Interaction Logs{" "}
              <span className="h-px flex-1 bg-slate-100" />
            </h4>
            <div className="relative pl-8 border-l-2 border-slate-100 ml-4 space-y-6">
              {activeCompany.history
                .slice()
                .reverse()
                .map((h) => (
                  <div key={h.id} className="relative group/timeline">
                    {/* Dynamic Node */}
                    <span className="absolute -left-[41px] top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white border shadow-sm group-hover/timeline:border-primary/50 transition-all duration-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary/80 group-hover/timeline:bg-primary transition-colors" />
                    </span>

                    <div className="bg-white border border-slate-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-xl p-3.5 group-hover/timeline:border-slate-300 group-hover/timeline:shadow-sm transition-all duration-300 relative">
                      <button
                        onClick={() => {
                          if (window.confirm("Remove this individual interaction?")) {
                            deleteAccount(h.id);
                            toast.success("Interaction deleted");
                            if (activeCompany.history.length === 1) {
                              setActiveCompanyTimeline(null);
                            }
                          }
                        }}
                        className="absolute top-3 right-3 p-1 rounded-md text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-100"
                        title="Delete interaction"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex items-start justify-between mb-2 gap-2 flex-wrap pr-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={h.month}
                              onChange={(e) => updateAccount(h.id, { month: e.target.value })}
                              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 w-24 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-800">{h.month}</span>
                          )}
                          <StatusBadge status={h.status} className="text-[9px]" />
                        </div>
                        {isEditMode ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md inline-flex items-center gap-1 border border-slate-200/30 cursor-pointer">
                                <CalendarIcon className="h-3 w-3 text-slate-500" />
                                {h.createdAt ? format(new Date(h.createdAt), "MMM dd, yyyy") : "Pick Date"}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white" align="start">
                              <Calendar
                                mode="single"
                                selected={h.createdAt ? new Date(h.createdAt) : undefined}
                                onSelect={(d) => {
                                  if (d) {
                                    updateAccount(h.id, { createdAt: d.toISOString() });
                                    toast.success("Interaction date updated");
                                  }
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          h.createdAt && (
                            <span className="text-[10px] font-medium bg-slate-100/80 text-slate-500 px-2 py-1 rounded-md inline-flex items-center gap-1 border border-slate-200/30">
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(h.createdAt), "MMM dd, yyyy")}
                            </span>
                          )
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-2 font-medium">
                        Logged by{" "}
                        <span className="text-slate-700 font-bold underline decoration-slate-200 underline-offset-2">
                          {h.owner}
                        </span>
                      </div>
                      {h.reason && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 italic leading-relaxed mb-2">
                          "{h.reason}"
                        </div>
                      )}

                      {/* Reminder Status Block inside Timeline Log */}
                      {h.reminderType && h.reminderType !== "none" && h.reminderDate && (
                        <div
                          className={`mt-2 flex items-center justify-between text-xs p-2 rounded-lg border ${
                            h.reminderClosed
                              ? "bg-slate-50 text-slate-400 border-slate-200/60"
                              : "bg-amber-50/50 text-amber-800 border-amber-200/60"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-medium">
                            <Clock
                              className={`h-3.5 w-3.5 ${h.reminderClosed ? "text-slate-400" : "text-amber-500"}`}
                            />
                            <span>
                              {h.reminderType === "reach_again" ? "Reach Again" : "Follow Up"}{" "}
                              Reminder: {format(new Date(h.reminderDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleReminderClosed(h.id, !!h.reminderClosed)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                              h.reminderClosed
                                ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                : "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                            }`}
                          >
                            {h.reminderClosed ? (
                              "Reopen"
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3" /> Mark Closed
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between sm:justify-between flex-row w-full">
          <Button
            variant="ghost"
            className="h-9 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs gap-2 rounded-lg transition-colors px-3"
            onClick={() => handleDeleteEntireCompany(activeCompany.name)}
          >
            <Trash2 className="h-4 w-4" /> Delete Entire Account
          </Button>
          <Button
            variant="outline"
            className="h-9 rounded-lg text-xs font-semibold px-4"
            onClick={() => setActiveCompanyTimeline(null)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Link } from "@tanstack/react-router";
import { MonthFilter } from "./MonthFilter";
import { LayoutDashboard, Users, BarChart3, XCircle, Save, Cloud, RefreshCcw, LogOut, CalendarClock, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { ALL_MONTHS } from "@/lib/seed-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { CompanyTimelineDialog } from "./CompanyTimelineDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types";


const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Users },
  { to: "/rejected", label: "Rejected", icon: XCircle },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;
 
function AutoSaveIndicator({ accounts, reps }: { accounts: any[], reps: any[] }) {
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    setIsSaving(true);
    const t = setTimeout(() => setIsSaving(false), 1000);
    return () => clearTimeout(t);
  }, [accounts, reps]);
 
  return (
    <div className={`flex items-center justify-center h-7 w-7 rounded-full transition-all duration-500 border ${
      isSaving ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
    }`} title={isSaving ? "Syncing..." : "Auto-saved"}>
      {isSaving ? (
        <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Cloud className="h-3.5 w-3.5 fill-current opacity-90" />
      )}
    </div>
  );
}

function ReminderItem({ reminder, isOverdue, isCompleted }: { reminder: Account; isOverdue?: boolean; isCompleted?: boolean }) {
  const updateAccount = useStore(s => s.updateAccount);
  const setActiveCompanyTimeline = useStore(s => s.setActiveCompanyTimeline);
  
  return (
    <div className={cn(
      "p-2 rounded-lg border transition-all flex items-start gap-2.5",
      isCompleted 
        ? "bg-slate-50/50 border-slate-100 text-slate-400" 
        : isOverdue 
          ? "bg-white border-amber-200/85 hover:border-amber-300 shadow-2xs" 
          : "bg-white border-slate-100 hover:border-slate-200 shadow-2xs"
    )}>
      {/* Complete Checkbox */}
      {!isCompleted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateAccount(reminder.id, { reminderClosed: true });
            toast.success(`Completed reminder for ${reminder.name}`);
          }}
          className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-slate-300 hover:border-primary flex items-center justify-center group"
          title="Mark Completed"
        >
          <span className="h-2 w-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span 
            role="button"
            onClick={() => setActiveCompanyTimeline(reminder.name)}
            className={cn(
              "font-bold text-xs truncate hover:underline hover:text-primary leading-tight text-left cursor-pointer block",
              isCompleted ? "text-slate-400" : "text-slate-700"
            )}
          >
            {reminder.name}
          </span>
          <span className={cn(
            "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded leading-none",
            reminder.reminderType === "reach_again" 
              ? "bg-sky-50 text-sky-700 border border-sky-100" 
              : "bg-amber-50 text-amber-700 border border-amber-100"
          )}>
            {reminder.reminderType === "reach_again" ? "Reach" : "Follow"}
          </span>
        </div>
        
        {reminder.reminderDate && (
          <div className="text-[10px] font-medium text-slate-400 mt-0.5">
            {format(new Date(reminder.reminderDate), "MMM dd, yyyy")}
          </div>
        )}

        {reminder.reason && (
          <div className="text-[10px] text-slate-500 italic truncate mt-0.5" title={reminder.reason}>
            "{reminder.reason}"
          </div>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { globalMonths, setGlobalMonths, accounts, reps, fetchData, subscribeRealtime } = useStore();
  const [now, setNow] = useState(() => new Date());

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("storefries_notifications_enabled") !== "false";
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("storefries_notifications_enabled", String(notificationsEnabled));
  }, [notificationsEnabled]);

  // Notification Engine Hook - triggers in-app toasts every 3 hours
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      const activeReminders = accounts.filter(
        (a) => a.reminderType && a.reminderType !== "none" && a.reminderDate && !a.reminderClosed && !a.id.startsWith("optimistic-")
      );

      const lastNotifiedRaw = localStorage.getItem("storefries_last_notified") || "{}";
      const lastNotified = JSON.parse(lastNotifiedRaw);
      let updatedLastNotified = false;

      activeReminders.forEach((acc) => {
        const rDate = new Date(acc.reminderDate!);
        if (rDate <= now) {
          const lastTime = lastNotified[acc.id];
          const shouldNotify = !lastTime || (now.getTime() - new Date(lastTime).getTime()) >= 3 * 60 * 60 * 1000;

          if (shouldNotify) {
            const title = `Reminder: ${acc.reminderType === "reach_again" ? "Reach Again" : "Follow Up"}`;
            const message = `It is time to contact ${acc.name}. ${acc.reason ? `Remark: "${acc.reason}"` : ""}`;

            // In-App Sonner Interactive Toast
            let toastId: string | number;
            toastId = toast.info(
              <div className="flex flex-col gap-1.5 w-full">
                <div className="font-bold text-slate-900">{title}</div>
                <div className="text-xs text-slate-600">{message}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-[10px] px-2 bg-white"
                    onClick={() => {
                      useStore.getState().setActiveCompanyTimeline(acc.name);
                      toast.dismiss(toastId);
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-7 text-[10px] px-2 bg-slate-800 hover:bg-slate-900 text-white"
                    onClick={() => {
                      toast.dismiss(toastId);
                    }}
                  >
                    Noticed
                  </Button>
                </div>
              </div>,
              {
                duration: Infinity,
              }
            );

            lastNotified[acc.id] = now.toISOString();
            updatedLastNotified = true;
          }
        }
      });

      if (updatedLastNotified) {
        localStorage.setItem("storefries_last_notified", JSON.stringify(lastNotified));
      }
    };

    checkReminders();
    const intervalId = setInterval(checkReminders, 30000); // check every 30s
    return () => clearInterval(intervalId);
  }, [accounts, notificationsEnabled]);

  const activeReminders = useMemo(() => {
    return accounts.filter(
      (a) => a.reminderType && a.reminderType !== "none" && !a.reminderClosed && !a.id.startsWith("optimistic-")
    );
  }, [accounts]);

  const sortedReminders = useMemo(() => {
    return [...activeReminders].sort((a, b) => {
      const dateA = new Date(a.reminderDate || 0);
      const dateB = new Date(b.reminderDate || 0);
      return dateA.getTime() - dateB.getTime();
    });
  }, [activeReminders]);

  const { overdue, upcoming } = useMemo(() => {
    const now = new Date();
    const overdueList: typeof accounts = [];
    const upcomingList: typeof accounts = [];
    sortedReminders.forEach(r => {
      if (r.reminderDate && new Date(r.reminderDate) <= now) {
        overdueList.push(r);
      } else {
        upcomingList.push(r);
      }
    });
    return { overdue: overdueList, upcoming: upcomingList };
  }, [sortedReminders]);

  const completedReminders = useMemo(() => {
    return accounts
      .filter((a) => a.reminderType && a.reminderType !== "none" && a.reminderClosed)
      .sort((a, b) => new Date(b.reminderDate || 0).getTime() - new Date(a.reminderDate || 0).getTime())
      .slice(0, 10);
  }, [accounts]);


  // ⚡️ Initialize real-time shared database hydration
  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeRealtime();
    return () => {
      unsubscribe();
    };
  }, [fetchData, subscribeRealtime]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const months = Array.from(new Set([...ALL_MONTHS, ...accounts.map((a) => a.month)]));

  const handleSaveSource = () => {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), accounts, reps }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `storefries-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data snapshot saved");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/app-logo.png" alt="Logo" className="h-14 w-auto rounded-xl object-contain bg-slate-50/50 p-0.5 shadow-sm" />
            <div className="hidden sm:block">
              <div className="text-lg font-bold tracking-tight text-gradient-brand">Storefries Sales</div>
              <div className="text-[10px] leading-tight text-muted-foreground font-medium">Outbound Sales Department</div>
            </div>
          </Link>

          <nav className="ml-4 hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-gradient-soft data-[status=active]:text-foreground"
              >
                <span className="inline-flex items-center gap-2">
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <span className="hidden lg:inline text-xs text-muted-foreground" suppressHydrationWarning>
              {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
            <AutoSaveIndicator accounts={accounts} reps={reps} />
            
            <MonthFilter months={months} selected={globalMonths} onChange={setGlobalMonths} />

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "relative h-9 w-9 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300",
                    overdue.length > 0 && "animate-pulse text-amber-600 hover:text-amber-700 bg-amber-50"
                  )}
                  title="Reminders & Notifications"
                >
                  <CalendarClock className="h-4.5 w-4.5" />
                  {activeReminders.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white">
                      {activeReminders.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-xl border border-slate-200 shadow-xl bg-white/95 backdrop-blur-sm z-50" align="end">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50/50">
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" /> Reminders
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Notify</span>
                    <Switch 
                      checked={notificationsEnabled} 
                      onCheckedChange={setNotificationsEnabled} 
                      aria-label="Toggle notifications"
                      className="scale-75"
                    />
                  </div>
                </div>
                
                {/* List Container */}
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar divide-y">
                  {/* Overdue Section */}
                  {overdue.length > 0 && (
                    <div className="p-2 bg-amber-50/20">
                      <div className="text-[9px] uppercase tracking-widest font-black text-amber-600 px-2 py-1 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" /> Overdue ({overdue.length})
                      </div>
                      <div className="space-y-1 mt-1">
                        {overdue.map(r => (
                          <ReminderItem key={r.id} reminder={r} isOverdue />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Section */}
                  {upcoming.length > 0 && (
                    <div className="p-2">
                      <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400 px-2 py-1">
                        Active & Upcoming ({upcoming.length})
                      </div>
                      <div className="space-y-1 mt-1">
                        {upcoming.map(r => (
                          <ReminderItem key={r.id} reminder={r} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {activeReminders.length === 0 && (
                    <div className="py-8 px-4 text-center text-xs text-slate-400 font-medium">
                      No active reminders.
                    </div>
                  )}

                  {/* Completed Section */}
                  {completedReminders.length > 0 && (
                    <div className="p-2 bg-slate-50/30">
                      <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400 px-2 py-1">
                        Recently Completed
                      </div>
                      <div className="space-y-1 mt-1 opacity-70">
                        {completedReminders.map(r => (
                          <ReminderItem key={r.id} reminder={r} isCompleted />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            
            <Button 
              onClick={async () => {
                await fetchData();
                toast.success("Database synchronization complete");
              }} 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-foreground group" 
              title="Save and Sync with Cloud"
            >
              <Save className="h-4 w-4" />
            </Button>

            <Button 
              onClick={async () => {
                await supabase.auth.signOut();
                toast.info("Signed out successfully");
              }} 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 group" 
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="md:hidden flex items-center gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent data-[status=active]:bg-gradient-soft data-[status=active]:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="px-4 md:px-6 py-6">{children}</main>

      <footer className="border-t mt-12 px-6 py-4 text-xs text-muted-foreground flex flex-wrap gap-2 justify-between">
        <span>© {new Date().getFullYear()} Storefries · Geosocial Promote</span>
        <span>Cold Calling Operations Dashboard</span>
      </footer>

      {/* Global Company Timeline Dialog */}
      <CompanyTimelineDialog />
    </div>
  );
}

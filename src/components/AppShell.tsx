import { Link } from "@tanstack/react-router";
import { MonthFilter } from "./MonthFilter";
import { LayoutDashboard, Users, BarChart3, XCircle, Save, Cloud, RefreshCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { ALL_MONTHS } from "@/lib/seed-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export function AppShell({ children }: { children: React.ReactNode }) {
  const { globalMonths, setGlobalMonths, accounts, reps, fetchData, subscribeRealtime } = useStore();
  const [now, setNow] = useState(() => new Date());

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
            <span className="hidden lg:inline text-xs text-muted-foreground">
              {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
            <AutoSaveIndicator accounts={accounts} reps={reps} />
            
            <MonthFilter months={months} selected={globalMonths} onChange={setGlobalMonths} />
            
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
    </div>
  );
}

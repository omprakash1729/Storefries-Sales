import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Users, BarChart3, XCircle, Save } from "lucide-react";
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const { globalMonth, setGlobalMonth, accounts, reps } = useStore();
  const [now, setNow] = useState(() => new Date());

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
            <img src="/storefries-logo.png" alt="Storefries" className="h-9 w-9 rounded-md object-contain" />
            <div className="hidden sm:block">
              <div className="text-base font-semibold leading-tight text-gradient-brand">Storefries Sales</div>
              <div className="text-xs text-muted-foreground">Outbound Sales Department</div>
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
            <Select value={globalMonth} onValueChange={setGlobalMonth}>
              <SelectTrigger className="h-9 w-[170px]">
                <SelectValue placeholder="Filter month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSaveSource} className="h-9 bg-gradient-brand text-white hover:opacity-90 border-0">
              <Save className="h-4 w-4" /> Save
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

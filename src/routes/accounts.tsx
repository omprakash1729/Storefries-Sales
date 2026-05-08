import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Plus, Search, Trash2, Download, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Account, AccountStatus, RepColor } from "@/lib/types";
import { INDUSTRIES, STATUS_LABEL } from "@/lib/types";
import { ALL_MONTHS } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { RepAvatar } from "@/components/dashboard-utils";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Storefries Sales" },
      { name: "description", content: "Edit, filter, search, add and export sales accounts." },
    ],
  }),
  component: AccountsPage,
});

const STATUSES: AccountStatus[] = ["prospect", "demo", "trial", "rejected"];
const COLORS: RepColor[] = ["blue", "green", "amber", "teal", "purple", "red"];

function AccountsPage() {
  const { accounts, reps, addAccount, updateAccount, deleteAccount, addRep, globalMonth } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddRep, setShowAddRep] = useState(false);

  const months = Array.from(new Set([...ALL_MONTHS, ...accounts.map((a) => a.month)]));
  const industries = Array.from(new Set([...INDUSTRIES, ...accounts.map((a) => a.industry)])).sort();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter((a) => {
      if (globalMonth !== "all" && a.month !== globalMonth) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (industryFilter !== "all" && a.industry !== industryFilter) return false;
      if (q && !(a.name.toLowerCase().includes(q) || a.owner.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [accounts, search, statusFilter, industryFilter, globalMonth]);

  const exportData = (rows: Account[], fmt: "csv" | "xlsx") => {
    const data = rows.map(({ id: _id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounts");
    const fname = `storefries-accounts-${new Date().toISOString().slice(0, 10)}.${fmt}`;
    if (fmt === "csv") {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fname; a.click();
      URL.revokeObjectURL(url);
    } else {
      XLSX.writeFile(wb, fname);
    }
    toast.success(`Exported ${rows.length} accounts as ${fmt.toUpperCase()}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {accounts.length} accounts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowAddRep(true)}><UserPlus className="h-4 w-4" />Add Rep</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportData(filtered, "csv")}>Export filtered (CSV)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData(filtered, "xlsx")}>Export filtered (Excel)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData(accounts, "csv")}>Export all (CSV)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData(accounts, "xlsx")}>Export all (Excel)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowAdd(true)} className="bg-gradient-brand text-white border-0 hover:opacity-90">
            <Plus className="h-4 w-4" />Add Account
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border bg-card p-4 shadow-card grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search company, owner, industry…" className="pl-9"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Industry</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Month</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Reason</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-t hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{a.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{a.industry}</td>
                  <td className="px-4 py-2.5">
                    <Select value={a.owner} onValueChange={(v) => updateAccount(a.id, { owner: v })}>
                      <SelectTrigger className="h-8 w-[160px] border-none bg-transparent shadow-none p-1 hover:bg-accent">
                        <div className="flex items-center gap-2">
                          <RepAvatar name={a.owner} />
                          <span className="text-xs">{a.owner}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {reps.map((r) => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{a.month}</td>
                  <td className="px-4 py-2.5">
                    <Select value={a.status} onValueChange={(v) => updateAccount(a.id, { status: v as AccountStatus })}>
                      <SelectTrigger className="h-8 w-[140px] border-none bg-transparent shadow-none p-1 hover:bg-accent">
                        <StatusBadge status={a.status} />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-xs truncate">{a.reason ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                      onClick={() => { deleteAccount(a.id); toast.success("Account deleted"); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">No accounts match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddAccountModal open={showAdd} onOpenChange={setShowAdd} onAdd={addAccount}
        industries={industries} months={months} reps={reps.map((r) => r.name)} />
      <AddRepModal open={showAddRep} onOpenChange={setShowAddRep} onAdd={addRep} existing={reps.map((r) => r.name)} />
    </div>
  );
}

function AddAccountModal({ open, onOpenChange, onAdd, industries, months, reps }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onAdd: (a: Omit<Account, "id">) => void;
  industries: string[]; months: string[]; reps: string[];
}) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState(industries[0] ?? "Other");
  const [owner, setOwner] = useState(reps[0] ?? "");
  const [status, setStatus] = useState<AccountStatus>("prospect");
  const [month, setMonth] = useState(months[0] ?? "April 2026");
  const [reason, setReason] = useState("");

  const submit = () => {
    if (!name.trim()) return toast.error("Account name required");
    if (!owner) return toast.error("Owner required");
    onAdd({ name: name.trim(), industry, owner, status, month, reason: reason.trim() || undefined });
    toast.success("Account added");
    setName(""); setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>Create a new prospect or lead in your pipeline.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Company name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Owner</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{reps.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AccountStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Notes / Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-brand text-white border-0 hover:opacity-90">Save Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddRepModal({ open, onOpenChange, onAdd, existing }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onAdd: (r: { name: string; color: RepColor }) => void; existing: string[];
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<RepColor>("blue");
  const submit = () => {
    if (!name.trim()) return toast.error("Rep name required");
    if (existing.includes(name.trim())) return toast.error("Rep already exists");
    onAdd({ name: name.trim(), color });
    toast.success("Rep added");
    setName("");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Sales Rep</DialogTitle>
          <DialogDescription>Add a new team member to assign accounts.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rep name" /></div>
          <div><Label>Color theme</Label>
            <div className="mt-1 flex gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`h-9 w-9 rounded-full transition ring-offset-2 ${color === c ? "ring-2 ring-foreground" : ""} ${
                    { blue: "bg-sky-500", green: "bg-emerald-500", amber: "bg-amber-500", teal: "bg-teal-500", purple: "bg-violet-500", red: "bg-rose-500" }[c]
                  }`}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-brand text-white border-0 hover:opacity-90">Save Rep</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

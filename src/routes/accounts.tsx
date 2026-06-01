import { createFileRoute } from "@tanstack/react-router";
import { MonthFilter } from "@/components/MonthFilter";
import { useMemo, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Plus, Search, Trash2, Download, UserPlus, CalendarIcon, X, FilterX, Clock, CalendarClock } from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useStore } from "@/lib/store";
import type { Account, AccountStatus, RepColor } from "@/lib/types";
import { groupAccountsByCompany, UniqueCompany } from "@/lib/crm-utils";
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
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Storefries Sales" },
      { name: "description", content: "Edit, filter, search, add and export sales accounts." },
    ],
  }),
  component: AccountsPage,
});

const STATUSES: AccountStatus[] = ["new_lead", "prospect", "demo", "proposal_sent", "trial", "rejected"];
const COLORS: RepColor[] = ["blue", "green", "amber", "teal", "purple", "red"];

function EditableCell({
  value,
  onSave,
  isEditMode,
  className = "",
  displayNode,
}: {
  value: string;
  onSave: (v: string) => void;
  isEditMode: boolean;
  className?: string;
  displayNode?: React.ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const save = () => {
    setIsEditing(false);
    if (tempValue.trim() !== value.trim()) {
      onSave(tempValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  if (isEditMode && isEditing) {
    return (
      <input
        autoFocus
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className="w-full border border-primary/40 ring-2 ring-primary/10 bg-white rounded px-1.5 py-0.5 text-slate-800 focus:outline-none"
      />
    );
  }

  return (
    <div
      onDoubleClick={() => isEditMode && setIsEditing(true)}
      className={`transition-all ${className} ${
        isEditMode
          ? "cursor-pointer hover:bg-slate-100 hover:ring-1 ring-slate-200 rounded px-1 -mx-1"
          : ""
      }`}
      title={isEditMode ? "Double click to edit" : undefined}
    >
      {displayNode ?? value}
    </div>
  );
}

function AccountsPage() {
  const { accounts, reps, addAccount, updateAccount, deleteAccount, addRep, globalMonths, setActiveCompanyTimeline } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddRep, setShowAddRep] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [prefillData, setPrefillData] = useState<Partial<Account> | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const months = Array.from(new Set([...ALL_MONTHS, ...accounts.map((a) => a.month)]));
  const industries = Array.from(new Set([...INDUSTRIES, ...accounts.map((a) => a.industry)])).sort();

  const hasFilters = search !== "" || 
                    statusFilter !== "all" || 
                    industryFilter !== "all" || 
                    ownerFilter !== "all" || 
                    dateRange !== undefined || 
                    globalMonths.length > 0;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setIndustryFilter("all");
    setOwnerFilter("all");
    setDateRange(undefined);
    useStore.getState().setGlobalMonths([]);
    toast.success("Filters cleared");
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter((a) => {
      if (globalMonths.length > 0 && !globalMonths.includes(a.month)) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (industryFilter !== "all" && a.industry !== industryFilter) return false;
      if (ownerFilter !== "all" && a.owner !== ownerFilter) return false;
      
      // Granular Date Range Filter logic
      if (dateRange?.from) {
        if (!a.createdAt) return false; // Legacy items without exact datetime are excluded from specific range
        const timestamp = new Date(a.createdAt);
        const rangeValid = isWithinInterval(timestamp, {
          start: startOfDay(dateRange.from),
          end: dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
        });
        if (!rangeValid) return false;
      }

      if (q && !(a.name.toLowerCase().includes(q) || a.owner.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [accounts, search, statusFilter, industryFilter, globalMonths, ownerFilter, dateRange]);

  const filteredUnique = useMemo(() => {
    return groupAccountsByCompany(filtered);
  }, [filtered]);

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

  const updateCompanyField = (oldName: string, patch: Partial<Account>) => {
    const targetAccounts = accounts.filter((a) => a.name === oldName);
    targetAccounts.forEach((a) => updateAccount(a.id, patch));
    toast.success("Company details synchronized across all history.");
  };

  const allUniqueCount = useMemo(() => groupAccountsByCompany(accounts).length, [accounts]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">{filteredUnique.length} of {allUniqueCount} unique companies</p>
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

          <div className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 rounded-md border ml-1 mr-1">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Edit Mode</span>
            <Switch checked={isEditMode} onCheckedChange={setIsEditMode} aria-label="Toggle edit mode" />
          </div>

          <Button onClick={() => { setPrefillData(null); setShowAdd(true); }} className="bg-gradient-brand text-white border-0 hover:opacity-90">
            <Plus className="h-4 w-4" />Add Account
          </Button>
        </div>
      </div>

      {/* Modern Unified Enterprise Sheet */}
      <div className="rounded-xl border border-slate-200/70 bg-card shadow-card overflow-hidden flex flex-col">
        
        {/* Seamless Integrated High-End Toolbar */}
        <div className="bg-slate-50/40 px-4 py-3 border-b border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 items-center">
          <div className="relative sm:col-span-2 xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search company, owner, industry…" 
              className="pl-9 bg-white border-slate-200/70 hover:border-slate-300 shadow-xs placeholder:text-slate-400 focus-visible:ring-slate-200 focus-visible:border-slate-300 transition-all"
              value={search} onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal truncate bg-violet-50/50 border border-violet-200 border-t-[3px] border-t-violet-500 hover:border-violet-300 hover:border-t-violet-600 hover:bg-violet-100/50 shadow-xs transition-all text-violet-700",
                  !dateRange && "text-violet-600/70"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-violet-500" />
                <span className="truncate flex-1">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>{format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}</>
                    ) : (
                      format(dateRange.from, "LLL dd")
                    )
                  ) : (
                    "Specific Date"
                  )}
                </span>
                {dateRange && (
                  <div role="button" onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }} className="ml-1 p-0.5 hover:bg-violet-100 rounded-full">
                    <X className="h-3 w-3 opacity-60 hover:opacity-100 text-violet-700" />
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>

          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="bg-blue-50/50 border border-blue-200 border-t-[3px] border-t-blue-500 hover:border-blue-300 hover:border-t-blue-600 hover:bg-blue-100/50 shadow-xs transition-all text-blue-700">
              <SelectValue placeholder="All Owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {reps.map((r) => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <MonthFilter 
            months={months} 
            selected={globalMonths} 
            onChange={(val) => useStore.getState().setGlobalMonths(val)} 
            className="w-full bg-teal-50/50 border border-teal-200 border-t-[3px] border-t-teal-500 hover:border-teal-300 hover:border-t-teal-600 hover:bg-teal-100/50 shadow-xs transition-all text-teal-700" 
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-amber-50/50 border border-amber-200 border-t-[3px] border-t-amber-500 hover:border-amber-300 hover:border-t-amber-600 hover:bg-amber-100/50 shadow-xs transition-all text-amber-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="bg-indigo-50/50 border border-indigo-200 border-t-[3px] border-t-indigo-500 hover:border-indigo-300 hover:border-t-indigo-600 hover:bg-indigo-100/50 shadow-xs transition-all text-indigo-700">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="default"
            onClick={clearFilters}
            disabled={!hasFilters}
            className={`h-9 px-3 flex items-center gap-1.5 text-xs font-semibold shadow-xs transition-all ${
              hasFilters 
                ? "text-rose-600 border border-rose-200 border-t-[3px] border-t-rose-500 bg-rose-50/50 hover:bg-rose-100/80 hover:text-rose-700 hover:border-rose-300 hover:border-t-rose-600" 
                : "text-slate-400/60 bg-slate-50/30 border-slate-200/60 border-dashed"
            }`}
          >
            <FilterX className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        </div>

        {/* High-Performance Spacious Table Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-5 py-3 font-bold tracking-wider">Company</th>
                <th className="text-left px-5 py-3 font-bold tracking-wider">Industry</th>
                <th className="text-left px-5 py-3 font-bold tracking-wider">Owner</th>
                <th className="text-left px-5 py-3 font-bold tracking-wider">Month</th>
                <th className="text-left px-5 py-3 font-bold tracking-wider">Status</th>
                <th className="text-center px-5 py-3 font-bold tracking-wider">Follow Ups</th>
                <th className="text-left px-5 py-3 font-bold tracking-wider">Remark</th>
                <th className="pl-5 py-3 text-right" style={{ width: '120px', minWidth: '120px', paddingRight: '24px' }}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filteredUnique.map((uc) => {
                const a = uc.mostRecent;
                const activeReminder = uc.history.find(h => h.reminderType && h.reminderType !== "none" && !h.reminderClosed);
                return (
                  <tr key={uc.name} className="hover:bg-slate-50/40 transition-colors group/row">
                    <td className="px-5 py-3.5">
                      <EditableCell
                        value={uc.name}
                        isEditMode={isEditMode}
                        onSave={(val) => updateCompanyField(uc.name, { name: val })}
                        className="font-bold text-slate-800 text-[14px]"
                        displayNode={
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span
                              onClick={() => !isEditMode && setActiveCompanyTimeline(uc.name)}
                              className={!isEditMode ? "cursor-pointer hover:text-primary hover:underline decoration-primary/30 underline-offset-2" : ""}
                            >
                              {uc.name}
                            </span>
                            {activeReminder && (
                              <span 
                                className={cn(
                                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none shadow-3xs",
                                  activeReminder.reminderType === "reach_again" 
                                    ? "bg-sky-50 text-sky-700 border-sky-200" 
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                )}
                                title={`${activeReminder.reminderType === "reach_again" ? "Reach Again" : "Follow Up"} scheduled for ${
                                  activeReminder.reminderDate ? format(new Date(activeReminder.reminderDate), "MMM dd, yyyy") : ""
                                }`}
                              >
                                <CalendarClock className="h-2.5 w-2.5 shrink-0" />
                                {activeReminder.reminderType === "reach_again" ? "Reach Again" : "Follow Up"}
                              </span>
                            )}
                          </div>
                        }
                      />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-medium">
                      <EditableCell
                        value={uc.industry}
                        isEditMode={isEditMode}
                        onSave={(val) => updateCompanyField(uc.name, { industry: val })}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      {!isEditMode ? (
                        <div className="flex items-center gap-2 h-8 text-slate-700 font-medium">
                          <RepAvatar name={a.owner} />
                          <span className="text-xs font-semibold text-slate-600">{a.owner}</span>
                        </div>
                      ) : (
                        <Select 
                          value={a.owner} 
                          onValueChange={(v) => updateAccount(a.id, { owner: v })}
                        >
                          <SelectTrigger className="h-8 w-[160px] border-none bg-transparent shadow-none p-1 hover:bg-slate-100 transition-all">
                            <div className="flex items-center gap-2">
                              <RepAvatar name={a.owner} />
                              <span className="text-xs font-semibold text-slate-600">{a.owner}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {reps.map((r) => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-medium text-xs">
                      <EditableCell
                        value={a.month}
                        isEditMode={isEditMode}
                        onSave={(val) => updateAccount(a.id, { month: val })}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      {!isEditMode ? (
                        <div className="h-8 flex items-center">
                          <StatusBadge status={a.status} className="shadow-xs border-slate-200/20" />
                        </div>
                      ) : (
                        <Select 
                          value={a.status} 
                          onValueChange={(v) => updateAccount(a.id, { status: v as AccountStatus })}
                        >
                          <SelectTrigger className="h-8 w-[140px] border-none bg-transparent shadow-none p-1 hover:bg-slate-100 transition-all">
                            <StatusBadge status={a.status} />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center">
                        {!isEditMode ? (
                          <div 
                            className="h-7 w-7 rounded-full bg-primary/5 border border-primary/10 text-primary font-extrabold flex items-center justify-center text-xs cursor-help shadow-xs hover:bg-primary/10 transition-all select-none"
                            title="Total interactions recorded"
                          >
                            {a.followUpCount ?? 0}
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            className="h-7 w-12 text-center text-xs font-bold border border-slate-200 shadow-xs rounded bg-white focus:ring-1 ring-primary/50 focus:border-primary focus:outline-none"
                            value={a.followUpCount ?? 0}
                            onChange={(e) => updateAccount(a.id, { followUpCount: parseInt(e.target.value) || 0 })}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium max-w-xs truncate italic group-hover/row:text-slate-600 transition-colors">
                      <EditableCell
                        value={a.reason ?? ""}
                        isEditMode={isEditMode}
                        onSave={(val) => updateAccount(a.id, { reason: val || undefined })}
                        displayNode={a.reason ?? "—"}
                      />
                    </td>
                    <td className="pl-5 py-3.5 text-right" style={{ width: '120px', minWidth: '120px', paddingRight: '24px' }}>
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity ml-auto" style={{ width: '72px' }}>
                        <Button 
                          variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          title="Log new interaction"
                          onClick={() => {
                            setPrefillData({ name: a.name, industry: a.industry, owner: a.owner, status: a.status });
                            setShowAdd(true);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {isEditMode ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            onClick={() => { deleteAccount(a.id); toast.success("Account deleted"); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUnique.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-400 font-medium bg-slate-50/20">No accounts match your current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddAccountModal open={showAdd} onOpenChange={setShowAdd} onAdd={addAccount} prefill={prefillData}
        industries={industries} months={months} reps={reps.map((r) => r.name)} />
      <AddRepModal open={showAddRep} onOpenChange={setShowAddRep} onAdd={addRep} existing={reps.map((r) => r.name)} />
    </div>
  );
}

function AddAccountModal({ open, onOpenChange, onAdd, industries, months, reps, prefill }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onAdd: (a: Omit<Account, "id">) => void;
  industries: string[]; months: string[]; reps: string[];
  prefill?: Partial<Account> | null;
}) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState(industries[0] ?? "Other");
  const [owner, setOwner] = useState(reps[0] ?? "");
  const [status, setStatus] = useState<AccountStatus>("new_lead");
  const [date, setDate] = useState<Date>(new Date());
  const [reason, setReason] = useState("");
  const [followUpCount, setFollowUpCount] = useState(0);
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [reminderType, setReminderType] = useState<"none" | "reach_again" | "followup">("none");
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setName(prefill?.name ?? "");
      setIndustry(prefill?.industry ?? industries[0] ?? "Other");
      setOwner(prefill?.owner ?? reps[0] ?? "");
      setStatus(prefill?.status ?? "new_lead");
      setReason("");
      setFollowUpCount(prefill?.followUpCount ?? 0);
      setDate(new Date()); // Always auto-select TODAY for a brand new interaction
      setIsCustomIndustry(false); // Reset to standard select mode on fresh open
      setReminderType("none");
      setReminderDate(undefined);
    }
  }, [open, prefill, industries, reps]);
 
  const submit = () => {
    if (!name.trim()) return toast.error("Account name required");
    if (!industry.trim()) return toast.error("Industry name required");
    if (!owner) return toast.error("Owner required");
    
    const derivedMonth = format(date, "MMMM yyyy");

    let reminderDateIso: string | undefined = undefined;
    if (reminderType !== "none" && reminderDate) {
      const d = new Date(reminderDate);
      d.setHours(0, 0, 0, 0);
      reminderDateIso = d.toISOString();
    }
    
    onAdd({ 
      name: name.trim(), 
      industry, 
      owner, 
      status, 
      month: derivedMonth, 
      reason: reason.trim() || undefined,
      createdAt: date.toISOString(),
      followUpCount: followUpCount,
      reminderType,
      reminderDate: reminderDateIso,
      reminderClosed: reminderType !== "none" ? false : undefined
    });
    
    toast.success("Account added");
    setName(""); setReason(""); setFollowUpCount(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
          <DialogDescription>Create a new prospect or lead in your pipeline.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Company name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Account Name" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Industry</Label>
              {isCustomIndustry ? (
                <div className="relative group">
                  <Input 
                     value={industry} 
                     onChange={(e) => setIndustry(e.target.value)} 
                     placeholder="E.g. Software" 
                     autoFocus 
                     className="h-10 pr-9 border-emerald-200 focus-visible:ring-emerald-500"
                  />
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setIsCustomIndustry(false); setIndustry(industries[0]); }}
                    className="h-8 w-8 absolute right-1 top-1 text-muted-foreground hover:text-slate-800"
                    title="Cancel custom entry"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Select value={industry} onValueChange={(v) => {
                  if (v === "CREATE_NEW") {
                    setIsCustomIndustry(true);
                    setIndustry("");
                  } else {
                    setIndustry(v);
                  }
                }}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREATE_NEW" className="text-emerald-600 font-bold flex items-center gap-1.5 border-b border-slate-100 bg-emerald-50/30 hover:bg-emerald-50">
                      <Plus className="inline h-3 w-3 mr-1" /> Add new industry
                    </SelectItem>
                    {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div><Label>Owner</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>{reps.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AccountStatus)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="mb-1 block">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Follow Ups</Label>
              <Input 
                type="number" 
                min="0" 
                value={followUpCount} 
                onChange={(e) => setFollowUpCount(parseInt(e.target.value) || 0)} 
                className="h-10 font-bold"
              />
            </div>
          </div>
          <div><Label>Remark</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="e.g. Interested in trial next week" /></div>
          
          <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
            <Label className="font-bold text-slate-800 flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 text-primary" /> Follow Up Reminder
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Reminder Action</Label>
                <Select value={reminderType} onValueChange={(v) => setReminderType(v as any)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Reminder</SelectItem>
                    <SelectItem value="reach_again">Reach Again (No Answer)</SelectItem>
                    <SelectItem value="followup">Follow Up (Needs Action)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {reminderType !== "none" && (
                <div>
                  <Label>Reminder Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !reminderDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reminderDate ? format(reminderDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={reminderDate}
                        onSelect={(d) => d && setReminderDate(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
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

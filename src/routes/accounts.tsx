import { createFileRoute } from "@tanstack/react-router";
import { MonthFilter } from "@/components/MonthFilter";
import { useMemo, useState, useEffect, memo, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  Plus,
  Search,
  Trash2,
  Download,
  UserPlus,
  CalendarIcon,
  X,
  FilterX,
  Clock,
  CalendarClock,
  Users,
  User,
  Upload,
} from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useStore } from "@/lib/store";
import type { Account, AccountStatus, RepColor, AccountContact } from "@/lib/types";
import { groupAccountsByCompany, UniqueCompany } from "@/lib/crm-utils";
import { INDUSTRIES, STATUS_LABEL } from "@/lib/types";
import { ALL_MONTHS } from "@/lib/seed-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { RepAvatar } from "@/components/dashboard-utils";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { AccountContactsDialog } from "@/components/AccountContactsDialog";
import { ImportContactsDialog } from "@/components/ImportContactsDialog";

export const Route = createFileRoute("/accounts")({
  head: () => ({
    meta: [
      { title: "Accounts — Storefries Sales" },
      { name: "description", content: "Edit, filter, search, add and export sales accounts." },
    ],
  }),
  component: AccountsPage,
});

const STATUSES: AccountStatus[] = [
  "new_lead",
  "prospect",
  "demo",
  "proposal_sent",
  "trial",
  "rejected",
];
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

const AccountRow = memo(function AccountRow({
  uc,
  isEditMode,
  reps,
  contacts,
  updateCompanyField,
  updateAccount,
  deleteAccount,
  setActiveCompanyTimeline,
  setPrefillData,
  setShowAdd,
  setContactsCompany,
}: {
  uc: UniqueCompany;
  isEditMode: boolean;
  reps: any[];
  contacts: import("@/lib/types").AccountContact[];
  updateCompanyField: (oldName: string, patch: Partial<Account>) => void;
  updateAccount: (id: string, patch: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setActiveCompanyTimeline: (name: string | null) => void;
  setPrefillData: (data: any) => void;
  setShowAdd: (show: boolean) => void;
  setContactsCompany: (name: string) => void;
}) {
  const a = uc.mostRecent;
  const activeReminder = uc.history.find(
    (h) => h.reminderType && h.reminderType !== "none" && !h.reminderClosed,
  );
  const contactCount = contacts.filter(
    (c) => c.accountName.toLowerCase() === uc.name.toLowerCase(),
  ).length;

  return (
    <tr className="hover:bg-slate-50/40 transition-colors group/row">
      <td className="px-7 py-4.5">
        <EditableCell
          value={uc.name}
          isEditMode={isEditMode}
          onSave={(val) => updateCompanyField(uc.name, { name: val })}
          className="font-bold text-slate-800 text-[14px]"
          displayNode={
            <div className="flex items-center flex-wrap gap-1.5">
              <span
                onClick={() => !isEditMode && setActiveCompanyTimeline(uc.name)}
                className={
                  !isEditMode
                    ? "cursor-pointer hover:text-primary hover:underline decoration-primary/30 underline-offset-2"
                    : ""
                }
              >
                {uc.name}
              </span>
              {contactCount > 0 && (
                <button
                  onClick={() => !isEditMode && setContactsCompany(uc.name)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none shadow-3xs bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                  title={`${contactCount} contact${contactCount !== 1 ? "s" : ""} — click to view`}
                >
                  <Users className="h-2.5 w-2.5 shrink-0" />
                  {contactCount}
                </button>
              )}
              {activeReminder && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border leading-none shadow-3xs",
                    activeReminder.reminderType === "reach_again"
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : "bg-amber-50 text-amber-700 border-amber-200",
                  )}
                  title={`${activeReminder.reminderType === "reach_again" ? "Reach Again" : "Follow Up"} scheduled for ${
                    activeReminder.reminderDate
                      ? format(new Date(activeReminder.reminderDate), "MMM dd, yyyy")
                      : ""
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
      <td className="px-7 py-4.5 text-slate-500 font-medium">
        <EditableCell
          value={uc.industry}
          isEditMode={isEditMode}
          onSave={(val) => updateCompanyField(uc.name, { industry: val })}
        />
      </td>
      <td className="px-7 py-4.5">
        {!isEditMode ? (
          <div className="flex items-center gap-2 h-8 text-slate-700 font-medium">
            <RepAvatar name={a.owner} />
            <span className="text-xs font-semibold text-slate-600">{a.owner}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 h-8">
            <RepAvatar name={a.owner} />
            <select
              value={a.owner}
              onChange={(e) => updateAccount(a.id, { owner: e.target.value })}
              className="h-7 w-[130px] text-xs font-semibold text-slate-600 bg-transparent hover:bg-slate-100 rounded px-1 border-none focus:ring-1 focus:ring-primary/30 focus:outline-none cursor-pointer"
            >
              {reps.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </td>
      <td className="px-7 py-4.5 text-slate-500 font-medium text-xs">
        <EditableCell
          value={a.month}
          isEditMode={isEditMode}
          onSave={(val) => updateAccount(a.id, { month: val })}
        />
      </td>
      <td className="px-7 py-4.5">
        {!isEditMode ? (
          <div className="h-8 flex items-center">
            <StatusBadge status={a.status} className="shadow-xs border-slate-200/20" />
          </div>
        ) : (
          <select
            value={a.status}
            onChange={(e) => updateAccount(a.id, { status: e.target.value as AccountStatus })}
            className={cn(
              "h-7 w-[130px] text-xs font-bold rounded-full px-2.5 py-0.5 border-none focus:outline-none cursor-pointer transition-all",
              a.status === "new_lead" && "bg-purple-50 text-purple-700 hover:bg-purple-100",
              a.status === "prospect" && "bg-sky-50 text-sky-700 hover:bg-sky-100",
              a.status === "demo" && "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
              a.status === "proposal_sent" && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
              a.status === "trial" && "bg-amber-50 text-amber-700 hover:bg-amber-100",
              a.status === "rejected" && "bg-rose-50 text-rose-700 hover:bg-rose-100",
            )}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-white text-slate-700 font-medium">
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        )}
      </td>
      <td className="px-7 py-4.5 text-center">
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
              onChange={(e) =>
                updateAccount(a.id, { followUpCount: parseInt(e.target.value) || 0 })
              }
            />
          )}
        </div>
      </td>
      <td className="px-7 py-4.5 text-xs text-slate-500 font-medium max-w-xs truncate italic group-hover/row:text-slate-600 transition-colors">
        <EditableCell
          value={a.reason ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateAccount(a.id, { reason: val || undefined })}
          displayNode={a.reason ?? "—"}
        />
      </td>
      <td
        className="pl-7 py-4.5 text-right w-px whitespace-nowrap"
        style={{ paddingRight: "24px" }}
      >
        <div
          className="flex items-center justify-end gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity ml-auto"
          style={{ width: "96px" }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title="View / manage contacts"
            onClick={() => setContactsCompany(uc.name)}
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            title="Log new interaction"
            onClick={() => {
              setPrefillData({
                name: a.name,
                industry: a.industry,
                owner: a.owner,
                status: a.status,
              });
              setShowAdd(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          {isEditMode ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              onClick={() => {
                deleteAccount(a.id);
                toast.success("Account deleted");
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
});

function AccountsPage() {
  const {
    accounts,
    reps,
    addAccount,
    updateAccount,
    deleteAccount,
    addRep,
    globalMonths,
    setActiveCompanyTimeline,
    contacts,
  } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddRep, setShowAddRep] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [reminderFilter, setReminderFilter] = useState<string>("all");
  const [prefillData, setPrefillData] = useState<Partial<Account> | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [contactsCompany, setContactsCompany] = useState<string | null>(null);

  const months = Array.from(new Set([...ALL_MONTHS, ...accounts.map((a) => a.month)]));
  const industries = Array.from(
    new Set([...INDUSTRIES, ...accounts.map((a) => a.industry)]),
  ).sort();

  const hasFilters =
    search !== "" ||
    statusFilter !== "all" ||
    industryFilter !== "all" ||
    ownerFilter !== "all" ||
    reminderFilter !== "all" ||
    dateRange !== undefined ||
    globalMonths.length > 0;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setIndustryFilter("all");
    setOwnerFilter("all");
    setReminderFilter("all");
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
          end: dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from),
        });
        if (!rangeValid) return false;
      }

      if (
        q &&
        !(
          a.name.toLowerCase().includes(q) ||
          a.owner.toLowerCase().includes(q) ||
          a.industry.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [accounts, search, statusFilter, industryFilter, globalMonths, ownerFilter, dateRange]);

  const filteredUnique = useMemo(() => {
    let result = groupAccountsByCompany(filtered);
    if (reminderFilter !== "all") {
      result = result.filter((uc) => {
        const activeReminder = uc.history.find(
          (h) => h.reminderType && h.reminderType !== "none" && !h.reminderClosed,
        );
        if (!activeReminder) return false;
        if (reminderFilter === "reach_again" && activeReminder.reminderType !== "reach_again")
          return false;
        if (reminderFilter === "followup" && activeReminder.reminderType !== "followup")
          return false;
        return true;
      });
    }
    return result;
  }, [filtered, reminderFilter]);

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
      a.href = url;
      a.download = fname;
      a.click();
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
    <div className="mx-auto max-w-[1600px] w-full px-8 py-8 space-y-6 md:space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">
            {filteredUnique.length} of {allUniqueCount} unique companies
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowAddRep(true)}>
            <UserPlus className="h-4 w-4" />
            Add Rep
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4" />
            Import Contacts
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportData(filtered, "csv")}>
                Export filtered (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData(filtered, "xlsx")}>
                Export filtered (Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData(accounts, "csv")}>
                Export all (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData(accounts, "xlsx")}>
                Export all (Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 rounded-md border ml-1 mr-1">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Edit Mode
            </span>
            <Switch
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
              aria-label="Toggle edit mode"
            />
          </div>

          <Button
            onClick={() => {
              setPrefillData(null);
              setShowAdd(true);
            }}
            className="bg-gradient-brand text-white border-0 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Modern Unified Enterprise Sheet */}
      <div className="rounded-xl border border-slate-200/70 bg-card shadow-card overflow-hidden flex flex-col">
        {/* Seamless Integrated High-End Toolbar */}
        <div className="bg-slate-50/40 px-6 py-4.5 border-b border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-3.5 items-center">
          <div className="relative sm:col-span-2 xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search company, owner, industry…"
              className="pl-9 bg-white border-slate-200/70 hover:border-slate-300 shadow-xs placeholder:text-slate-400 focus-visible:ring-slate-200 focus-visible:border-slate-300 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal truncate bg-violet-50/50 border border-violet-200 border-t-[3px] border-t-violet-500 hover:border-violet-300 hover:border-t-violet-600 hover:bg-violet-100/50 shadow-xs transition-all text-violet-700",
                  !dateRange && "text-violet-600/70",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-violet-500" />
                <span className="truncate flex-1">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd")
                    )
                  ) : (
                    "Specific Date"
                  )}
                </span>
                {dateRange && (
                  <div
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDateRange(undefined);
                    }}
                    className="ml-1 p-0.5 hover:bg-violet-100 rounded-full"
                  >
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
              {reps.map((r) => (
                <SelectItem key={r.name} value={r.name}>
                  {r.name}
                </SelectItem>
              ))}
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
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="bg-indigo-50/50 border border-indigo-200 border-t-[3px] border-t-indigo-500 hover:border-indigo-300 hover:border-t-indigo-600 hover:bg-indigo-100/50 shadow-xs transition-all text-indigo-700">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={reminderFilter} onValueChange={setReminderFilter}>
            <SelectTrigger className="bg-rose-50/50 border border-rose-200 border-t-[3px] border-t-rose-500 hover:border-rose-300 hover:border-t-rose-600 hover:bg-rose-100/50 shadow-xs transition-all text-rose-700">
              <SelectValue placeholder="Reminders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="has_reminder">Reminders Only</SelectItem>
              <SelectItem value="reach_again">Reach Again</SelectItem>
              <SelectItem value="followup">Follow Up</SelectItem>
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
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-7 py-4.5 font-bold tracking-wider">Company</th>
                <th className="text-left px-7 py-4.5 font-bold tracking-wider">Industry</th>
                <th className="text-left px-7 py-4.5 font-bold tracking-wider">Owner</th>
                <th className="text-left px-7 py-4.5 font-bold tracking-wider">Month</th>
                <th className="text-left px-7 py-4.5 font-bold tracking-wider">Status</th>
                <th className="text-center px-7 py-4.5 font-bold tracking-wider">Follow Ups</th>
                <th className="text-left px-7 py-4.5 font-bold tracking-wider">Remark</th>
                <th
                  className="pl-7 py-4.5 text-right w-px whitespace-nowrap"
                  style={{ paddingRight: "24px" }}
                ></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filteredUnique.map((uc) => (
                <AccountRow
                  key={uc.name}
                  uc={uc}
                  isEditMode={isEditMode}
                  reps={reps}
                  contacts={contacts}
                  updateCompanyField={updateCompanyField}
                  updateAccount={updateAccount}
                  deleteAccount={deleteAccount}
                  setActiveCompanyTimeline={setActiveCompanyTimeline}
                  setPrefillData={setPrefillData}
                  setShowAdd={setShowAdd}
                  setContactsCompany={setContactsCompany}
                />
              ))}
              {filteredUnique.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-sm text-slate-400 font-medium bg-slate-50/20"
                  >
                    No accounts match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddAccountModal
        open={showAdd}
        onOpenChange={setShowAdd}
        onAdd={addAccount}
        prefill={prefillData}
        industries={industries}
        months={months}
        reps={reps.map((r) => r.name)}
      />
      <AddRepModal
        open={showAddRep}
        onOpenChange={setShowAddRep}
        onAdd={addRep}
        existing={reps.map((r) => r.name)}
      />
      <AccountContactsDialog
        companyName={contactsCompany}
        open={!!contactsCompany}
        onOpenChange={(v) => {
          if (!v) setContactsCompany(null);
        }}
      />
      <ImportContactsDialog open={showImport} onOpenChange={setShowImport} />
    </div>
  );
}

function AddAccountModal({
  open,
  onOpenChange,
  onAdd,
  industries,
  months,
  reps,
  prefill,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (a: Omit<Account, "id">) => void;
  industries: string[];
  months: string[];
  reps: string[];
  prefill?: Partial<Account> | null;
}) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState(industries[0] ?? "Other");
  const [owner, setOwner] = useState(() =>
    reps.includes("Bhuvaneshwari") ? "Bhuvaneshwari" : (reps[0] ?? ""),
  );
  const [status, setStatus] = useState<AccountStatus>("new_lead");
  const [date, setDate] = useState<Date>(new Date());
  const [reason, setReason] = useState("");
  const [followUpCount, setFollowUpCount] = useState(0);
  const [isCustomIndustry, setIsCustomIndustry] = useState(false);
  const [reminderType, setReminderType] = useState<"none" | "reach_again" | "followup">("none");
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);

  // Draft contacts state
  const [draftContacts, setDraftContacts] = useState<Omit<AccountContact, "id" | "accountName">[]>(
    [],
  );
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cDesig, setCDesig] = useState("");
  const [cLinkedin, setCLinkedin] = useState("");
  const [cRemark, setCRemark] = useState("");

  // Caching states
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const resetToEmpty = useCallback(() => {
    setName("");
    setIndustry(industries[0] ?? "Other");
    setOwner(reps.includes("Bhuvaneshwari") ? "Bhuvaneshwari" : (reps[0] ?? ""));
    setStatus("new_lead");
    setReason("");
    setFollowUpCount(0);
    setDate(new Date());
    setIsCustomIndustry(false);
    setReminderType("none");
    setReminderDate(undefined);
    setDraftContacts([]);
    setIsRestored(false);
  }, [industries, reps]);

  // Load draft from localStorage on open
  useEffect(() => {
    if (open) {
      if (prefill) {
        setName(prefill.name ?? "");
        setIndustry(prefill.industry ?? industries[0] ?? "Other");
        setOwner(
          prefill.owner ?? (reps.includes("Bhuvaneshwari") ? "Bhuvaneshwari" : (reps[0] ?? "")),
        );
        setStatus(prefill.status ?? "new_lead");
        setReason("");
        setFollowUpCount(prefill.followUpCount ?? 0);
        setDate(new Date());
        setIsCustomIndustry(false);
        setReminderType("none");
        setReminderDate(undefined);
        setDraftContacts([]);
        setIsRestored(false);
        setIsLoaded(true);
      } else {
        const draftRaw = localStorage.getItem("prospect_pulse_add_account_draft");
        if (draftRaw) {
          try {
            const draft = JSON.parse(draftRaw);
            setName(draft.name ?? "");
            setIndustry(draft.industry ?? industries[0] ?? "Other");
            setOwner(
              draft.owner ?? (reps.includes("Bhuvaneshwari") ? "Bhuvaneshwari" : (reps[0] ?? "")),
            );
            setStatus(draft.status ?? "new_lead");
            setReason(draft.reason ?? "");
            setFollowUpCount(draft.followUpCount ?? 0);

            const parsedDate = draft.date ? new Date(draft.date) : new Date();
            setDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);

            if (draft.industry && !industries.includes(draft.industry)) {
              setIsCustomIndustry(true);
            } else {
              setIsCustomIndustry(false);
            }

            setReminderType(draft.reminderType ?? "none");

            const parsedReminderDate = draft.reminderDate
              ? new Date(draft.reminderDate)
              : undefined;
            setReminderDate(
              parsedReminderDate && !isNaN(parsedReminderDate.getTime())
                ? parsedReminderDate
                : undefined,
            );

            setDraftContacts(draft.draftContacts ?? []);
            setIsRestored(true);
            setIsLoaded(true);
          } catch (e) {
            console.error("Failed to parse add account draft", e);
            resetToEmpty();
            setIsLoaded(true);
          }
        } else {
          resetToEmpty();
          setIsLoaded(true);
        }
      }

      setCName("");
      setCPhone("");
      setCDesig("");
      setCLinkedin("");
      setCRemark("");
    } else {
      setIsLoaded(false);
      setIsRestored(false);
    }
  }, [open, prefill, industries, reps, resetToEmpty]);

  // Sync state to localStorage draft
  useEffect(() => {
    if (open && isLoaded) {
      const draft = {
        name,
        industry,
        owner,
        status,
        date: date.toISOString(),
        reason,
        followUpCount,
        reminderType,
        reminderDate: reminderDate?.toISOString(),
        draftContacts,
      };
      localStorage.setItem("prospect_pulse_add_account_draft", JSON.stringify(draft));
    }
  }, [
    name,
    industry,
    owner,
    status,
    date,
    reason,
    followUpCount,
    reminderType,
    reminderDate,
    draftContacts,
    open,
    isLoaded,
  ]);

  const handleAddDraftContact = () => {
    if (!cName.trim()) {
      return toast.error("Contact name is required");
    }
    setDraftContacts([
      ...draftContacts,
      {
        contactName: cName.trim(),
        phone: cPhone.trim() || undefined,
        designation: cDesig.trim() || undefined,
        linkedin: cLinkedin.trim() || undefined,
        remark: cRemark.trim() || undefined,
      },
    ]);
    setCName("");
    setCPhone("");
    setCDesig("");
    setCLinkedin("");
    setCRemark("");
    toast.success("Contact added to draft list");
  };

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
      reminderClosed: reminderType !== "none" ? false : undefined,
    });

    // Save staged contacts (include any typed contact that hasn't been added to draft list yet)
    const contactsToSave = [...draftContacts];
    if (cName.trim()) {
      contactsToSave.push({
        contactName: cName.trim(),
        phone: cPhone.trim() || undefined,
        designation: cDesig.trim() || undefined,
        linkedin: cLinkedin.trim() || undefined,
        remark: cRemark.trim() || undefined,
      });
    }

    if (contactsToSave.length > 0) {
      const addContact = useStore.getState().addContact;
      contactsToSave.forEach((dc) => {
        addContact({
          ...dc,
          accountName: name.trim(),
        });
      });
    }

    toast.success("Account added");
    localStorage.removeItem("prospect_pulse_add_account_draft");
    resetToEmpty();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900">Add Account</DialogTitle>
          <DialogDescription className="text-slate-500">
            Create a new prospect or lead in your pipeline and optionally associate contacts.
          </DialogDescription>
        </DialogHeader>

        {isRestored && (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 text-xs text-indigo-800 shrink-0 mt-2">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              Restored unsaved draft details.
            </span>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("prospect_pulse_add_account_draft");
                resetToEmpty();
                toast.info("Draft cleared");
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline cursor-pointer"
            >
              Reset Form
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left Column: Account Details */}
          <div className="space-y-4 md:pr-6 md:border-r border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
              Account Details
            </h3>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-slate-600">Company name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Account Name"
                  className="h-10 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-600">Industry</Label>
                  <div className="mt-1">
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
                          onClick={() => {
                            setIsCustomIndustry(false);
                            setIndustry(industries[0]);
                          }}
                          className="h-8 w-8 absolute right-1 top-1 text-muted-foreground hover:text-slate-800"
                          title="Cancel custom entry"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={industry}
                        onValueChange={(v) => {
                          if (v === "CREATE_NEW") {
                            setIsCustomIndustry(true);
                            setIndustry("");
                          } else {
                            setIndustry(v);
                          }
                        }}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value="CREATE_NEW"
                            className="text-emerald-600 font-bold flex items-center gap-1.5 border-b border-slate-100 bg-emerald-50/30 hover:bg-emerald-50"
                          >
                            <Plus className="inline h-3 w-3 mr-1" /> Add new industry
                          </SelectItem>
                          {industries.map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-600">Owner</Label>
                  <Select value={owner} onValueChange={setOwner}>
                    <SelectTrigger className="h-10 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reps.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-600">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as AccountStatus)}>
                    <SelectTrigger className="h-10 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-600">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 mt-1",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
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

                <div className="col-span-2">
                  <Label className="text-xs font-semibold text-slate-600">Follow Ups</Label>
                  <Input
                    type="number"
                    min="0"
                    value={followUpCount}
                    onChange={(e) => setFollowUpCount(parseInt(e.target.value) || 0)}
                    className="h-10 mt-1 font-bold"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-600">Remark</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Interested in trial next week"
                  className="mt-1 resize-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
                <Label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-primary" /> Follow Up Reminder
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500">Reminder Action</Label>
                    <Select value={reminderType} onValueChange={(v) => setReminderType(v as any)}>
                      <SelectTrigger className="h-10 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Reminder</SelectItem>
                        <SelectItem value="reach_again">Reach Again</SelectItem>
                        <SelectItem value="followup">Follow Up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {reminderType !== "none" && (
                    <div>
                      <Label className="text-xs font-semibold text-slate-500">Reminder Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal h-10 mt-1",
                              !reminderDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
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
          </div>

          {/* Right Column: Contacts builder */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">
                Contacts (Optional)
              </h3>

              {/* List of staged contacts */}
              {draftContacts.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {draftContacts.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-indigo-950 truncate flex items-center gap-1.5">
                          <User className="h-3 w-3 text-indigo-500" />
                          {c.contactName}
                        </div>
                        <div className="text-indigo-700/80 truncate mt-0.5">
                          {c.designation && <span>{c.designation}</span>}
                          {c.phone && <span> · {c.phone}</span>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 ml-2"
                        onClick={() => setDraftContacts(draftContacts.filter((_, i) => i !== idx))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  No contacts staged yet. Add some using the form below.
                </div>
              )}

              {/* Form to add a new contact */}
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/20 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Add a Contact to Staging
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2">
                    <Label className="text-[10px] font-semibold text-slate-500">
                      Contact Name *
                    </Label>
                    <Input
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="h-9 mt-0.5 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold text-slate-500">Phone</Label>
                    <Input
                      value={cPhone}
                      onChange={(e) => setCPhone(e.target.value)}
                      placeholder="+91..."
                      className="h-9 mt-0.5 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold text-slate-500">Designation</Label>
                    <Input
                      value={cDesig}
                      onChange={(e) => setCDesig(e.target.value)}
                      placeholder="e.g. Director"
                      className="h-9 mt-0.5 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] font-semibold text-slate-500">
                      LinkedIn Profile URL
                    </Label>
                    <Input
                      value={cLinkedin}
                      onChange={(e) => setCLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/..."
                      className="h-9 mt-0.5 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] font-semibold text-slate-500">Remark</Label>
                    <Input
                      value={cRemark}
                      onChange={(e) => setCRemark(e.target.value)}
                      placeholder="e.g. Decision maker"
                      className="h-9 mt-0.5 text-xs"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAddDraftContact}
                  variant="outline"
                  size="sm"
                  className="w-full mt-1 border-indigo-200 text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50 text-xs font-semibold h-9"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Contact to List
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("prospect_pulse_add_account_draft");
              resetToEmpty();
              onOpenChange(false);
            }}
            className="h-10"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            className="bg-gradient-brand text-white border-0 hover:opacity-90 h-10 px-6 font-semibold"
          >
            Save Account & Contacts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddRepModal({
  open,
  onOpenChange,
  onAdd,
  existing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (r: { name: string; color: RepColor }) => void;
  existing: string[];
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
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rep name" />
          </div>
          <div>
            <Label>Color theme</Label>
            <div className="mt-1 flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-9 w-9 rounded-full transition ring-offset-2 ${color === c ? "ring-2 ring-foreground" : ""} ${
                    {
                      blue: "bg-sky-500",
                      green: "bg-emerald-500",
                      amber: "bg-amber-500",
                      teal: "bg-teal-500",
                      purple: "bg-violet-500",
                      red: "bg-rose-500",
                    }[c]
                  }`}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            className="bg-gradient-brand text-white border-0 hover:opacity-90"
          >
            Save Rep
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

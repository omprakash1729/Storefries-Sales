import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, memo } from "react";
import * as XLSX from "xlsx";
import {
  Plus,
  Search,
  Trash2,
  Download,
  X,
  FilterX,
  Users,
  Upload,
  Briefcase,
  Building
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { FranchiseConsultant, OutreachStatus } from "@/lib/types";
import { OUTREACH_STATUS_LABEL } from "@/lib/types";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Switch } from "@/components/ui/switch";
import { RepAvatar, KpiCard } from "@/components/dashboard-utils";
import { toast } from "sonner";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const Route = createFileRoute("/franchise")({
  head: () => ({
    meta: [
      { title: "Franchise Consultants — Storefries Sales" },
      { name: "description", content: "Manage and track Franchise consultants outreach pipeline." },
    ],
  }),
  component: FranchisePage,
});

const STATUSES: OutreachStatus[] = [
  "reached_out",
  "medium",
  "read",
  "replied",
  "demo_booked",
];

const STATUS_STYLE: Record<OutreachStatus, string> = {
  reached_out: "bg-purple-50 text-purple-700 hover:bg-purple-100",
  medium: "bg-sky-50 text-sky-700 hover:bg-sky-100",
  read: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
  replied: "bg-teal-50 text-teal-700 hover:bg-teal-100",
  demo_booked: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
};

function StatusBadge({ status, className = "" }: { status: OutreachStatus; className?: string }) {
  const dotColor: Record<OutreachStatus, string> = {
    reached_out: "bg-purple-500",
    medium: "bg-sky-500",
    read: "bg-indigo-500",
    replied: "bg-teal-500",
    demo_booked: "bg-emerald-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide shadow-3xs ${STATUS_STYLE[status]} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[status]}`} />
      {OUTREACH_STATUS_LABEL[status]}
    </span>
  );
}

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

const ConsultantRow = memo(function ConsultantRow({
  c,
  isEditMode,
  reps,
  updateFranchiseConsultant,
  deleteFranchiseConsultant,
}: {
  c: FranchiseConsultant;
  isEditMode: boolean;
  reps: any[];
  updateFranchiseConsultant: (id: string, patch: Partial<FranchiseConsultant>) => Promise<void>;
  deleteFranchiseConsultant: (id: string) => Promise<void>;
}) {
  return (
    <tr className="hover:bg-slate-50/40 transition-colors group/row">
      <td className="px-6 py-4">
        <EditableCell
          value={c.name}
          isEditMode={isEditMode}
          onSave={(val) => updateFranchiseConsultant(c.id, { name: val })}
          className="font-bold text-slate-800 text-[14px]"
        />
      </td>
      <td className="px-6 py-4 text-slate-500 font-medium">
        <EditableCell
          value={c.company ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateFranchiseConsultant(c.id, { company: val || undefined })}
          displayNode={c.company ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-slate-500 font-medium">
        <EditableCell
          value={c.designation ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateFranchiseConsultant(c.id, { designation: val || undefined })}
          displayNode={c.designation ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-emerald-600 font-semibold text-xs">
        <EditableCell
          value={c.region ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateFranchiseConsultant(c.id, { region: val || undefined })}
          displayNode={c.region ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-slate-500 font-medium text-xs">
        <EditableCell
          value={c.phone ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateFranchiseConsultant(c.id, { phone: val || undefined })}
          displayNode={c.phone ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-slate-500 font-medium text-xs">
        <EditableCell
          value={c.email ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateFranchiseConsultant(c.id, { email: val || undefined })}
          displayNode={c.email ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-xs">
        {c.linkedin ? (
          <a
            href={c.linkedin.startsWith("http") ? c.linkedin : `https://${c.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            LinkedIn ↗
          </a>
        ) : (
          <EditableCell
            value=""
            isEditMode={isEditMode}
            onSave={(val) => updateFranchiseConsultant(c.id, { linkedin: val || undefined })}
            displayNode="—"
          />
        )}
      </td>
      <td className="px-6 py-4">
        {!isEditMode ? (
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border">
            {c.medium ?? "LinkedIn"}
          </span>
        ) : (
          <select
            value={c.medium ?? "LinkedIn"}
            onChange={(e) => updateFranchiseConsultant(c.id, { medium: e.target.value as any })}
            className="h-7 text-xs font-medium bg-transparent hover:bg-slate-100 rounded px-1 border-none focus:outline-none cursor-pointer"
          >
            <option value="LinkedIn">LinkedIn</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="Call">Call</option>
          </select>
        )}
      </td>
      <td className="px-6 py-4">
        {!isEditMode ? (
          <StatusBadge status={c.status} />
        ) : (
          <select
            value={c.status}
            onChange={(e) => updateFranchiseConsultant(c.id, { status: e.target.value as OutreachStatus })}
            className={`h-7 w-[120px] text-xs font-bold rounded-full px-2 py-0.5 border-none focus:outline-none cursor-pointer transition-all ${STATUS_STYLE[c.status]}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-white text-slate-700 font-medium">
                {OUTREACH_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        )}
      </td>
      <td className="px-6 py-4">
        {!isEditMode ? (
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <RepAvatar name={c.owner} />
            <span className="text-xs font-semibold text-slate-600">{c.owner}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <RepAvatar name={c.owner} />
            <select
              value={c.owner}
              onChange={(e) => updateFranchiseConsultant(c.id, { owner: e.target.value })}
              className="h-7 text-xs font-semibold text-slate-600 bg-transparent hover:bg-slate-100 rounded px-1 border-none focus:outline-none cursor-pointer"
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
      <td className="px-6 py-4 text-xs text-slate-500 font-medium max-w-[150px] truncate italic">
        <EditableCell
          value={c.remark ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateFranchiseConsultant(c.id, { remark: val || undefined })}
          displayNode={c.remark ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-right w-px whitespace-nowrap">
        {isEditMode ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            onClick={() => {
              deleteFranchiseConsultant(c.id);
              toast.success("Consultant deleted");
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </td>
    </tr>
  );
});

function FranchisePage() {
  const {
    franchiseConsultants,
    reps,
    addFranchiseConsultant,
    updateFranchiseConsultant,
    deleteFranchiseConsultant,
    importFranchiseConsultants,
  } = useStore();

  const [search, setSearch] = useState("");
  const [statusRules, setStatusRules] = useState<Record<string, "include" | "exclude">>({});
  const [mediumRules, setMediumRules] = useState<Record<string, "include" | "exclude">>({});
  const [ownerRules, setOwnerRules] = useState<Record<string, "include" | "exclude">>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLinkedin, setNewLinkedin] = useState("");
  const [newStatus, setNewStatus] = useState<OutreachStatus>("reached_out");
  const [newMedium, setNewMedium] = useState<"LinkedIn" | "WhatsApp" | "Email" | "Call">("LinkedIn");
  const [newOwner, setNewOwner] = useState(reps[0]?.name || "Bhuvaneshwari");
  const [newRemark, setNewRemark] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    const toSets = (rules: Record<string, "include" | "exclude">) => ({
      inc: new Set(Object.entries(rules).filter(([, m]) => m === "include").map(([k]) => k)),
      exc: new Set(Object.entries(rules).filter(([, m]) => m === "exclude").map(([k]) => k)),
    });
    const status = toSets(statusRules);
    const medium = toSets(mediumRules);
    const owner = toSets(ownerRules);

    return franchiseConsultants.filter((c) => {
      if (status.inc.size > 0 && !status.inc.has(c.status)) return false;
      if (status.exc.has(c.status)) return false;

      if (medium.inc.size > 0 && (!c.medium || !medium.inc.has(c.medium))) return false;
      if (c.medium && medium.exc.has(c.medium)) return false;

      if (owner.inc.size > 0 && !owner.inc.has(c.owner)) return false;
      if (owner.exc.has(c.owner)) return false;

      if (
        q &&
        !(
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.region && c.region.toLowerCase().includes(q)) ||
          c.owner.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [franchiseConsultants, search, statusRules, mediumRules, ownerRules]);

  const metrics = useMemo(() => {
    const m = {
      total: franchiseConsultants.length,
      reached_out: 0,
      medium: 0,
      read: 0,
      replied: 0,
      demo_booked: 0,
      conversion: 0,
    };
    for (const c of franchiseConsultants) {
      if (c.status in m) {
        m[c.status as keyof typeof m]++;
      }
    }
    m.conversion = m.total === 0 ? 0 : Math.round((m.demo_booked / m.total) * 1000) / 10;
    return m;
  }, [franchiseConsultants]);

  const handleToggleFilter = (status: string) => {
    setStatusRules((prev) => {
      if (prev[status] === "include") {
        const next = { ...prev };
        delete next[status];
        return next;
      }
      return { ...prev, [status]: "include" };
    });
  };

  const funnelData = {
    labels: ["Reached Out", "Medium", "Read", "Replied", "Demo Booked"],
    datasets: [
      {
        label: "Consultants",
        data: [
          metrics.reached_out,
          metrics.medium,
          metrics.read,
          metrics.replied,
          metrics.demo_booked,
        ],
        backgroundColor: ["#8b5cf6", "#0ea5e9", "#6366f1", "#14b8a6", "#10b981"],
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Consultant name is required");
      return;
    }
    addFranchiseConsultant({
      name: newName.trim(),
      company: newCompany.trim() || undefined,
      designation: newDesignation.trim() || undefined,
      region: newRegion.trim() || undefined,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      linkedin: newLinkedin.trim() || undefined,
      status: newStatus,
      medium: newMedium,
      owner: newOwner,
      remark: newRemark.trim() || undefined,
    });
    toast.success("Franchise Consultant added successfully");
    setShowAdd(false);

    // Reset Form
    setNewName("");
    setNewCompany("");
    setNewDesignation("");
    setNewRegion("");
    setNewPhone("");
    setNewEmail("");
    setNewLinkedin("");
    setNewStatus("reached_out");
    setNewMedium("LinkedIn");
    setNewRemark("");
  };

  const exportData = (rows: FranchiseConsultant[], fmt: "csv" | "xlsx") => {
    const data = rows.map(({ id: _id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Franchise Consultants");
    const fname = `franchise-consultants-${new Date().toISOString().slice(0, 10)}.${fmt}`;
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
    toast.success(`Exported ${rows.length} consultants as ${fmt.toUpperCase()}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const raw = XLSX.utils.sheet_to_json(ws) as any[];

        const cleanList = raw.map((row) => ({
          name: String(row.name || row.Name || "").trim(),
          company: row.company || row.Company || undefined,
          designation: row.designation || row.Designation || undefined,
          region: row.region || row.Region || row.Location || row.location || undefined,
          phone: row.phone ? String(row.phone) : undefined,
          email: row.email || row.Email || undefined,
          linkedin: row.linkedin || row.LinkedIn || undefined,
          status: (row.status || row.Status || "reached_out").toLowerCase().replace(" ", "_") as OutreachStatus,
          medium: (row.medium || row.Medium || "LinkedIn") as any,
          owner: row.owner || row.Owner || reps[0]?.name || "Bhuvaneshwari",
          remark: row.remark || row.Remark || undefined,
        })).filter(x => x.name);

        if (cleanList.length === 0) {
          toast.error("No valid consultants found in sheet.");
          return;
        }

        importFranchiseConsultants(cleanList);
        setShowImport(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse file. Make sure columns match Franchise Consultant fields.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Franchise Consultants Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Outreach tracker and statistics for Franchise Brokers and Consultants.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4" />
            Import CSV/Excel
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
              <DropdownMenuItem onClick={() => exportData(franchiseConsultants, "csv")}>
                Export all (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData(franchiseConsultants, "xlsx")}>
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
            onClick={() => setShowAdd(true)}
            className="bg-gradient-brand text-white border-0 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Consultant
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
        <KpiCard
          label="Total Consultants"
          value={metrics.total}
          sub="Franchise network"
          theme="indigo"
          onClick={() => setStatusRules({})}
          active={Object.keys(statusRules).length === 0}
        />
        <KpiCard
          label="Reached Out"
          value={metrics.reached_out}
          sub="Outreach initiated"
          theme="violet"
          progress={(metrics.reached_out / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("reached_out")}
          active={statusRules["reached_out"] === "include"}
        />
        <KpiCard
          label="Medium Status"
          value={metrics.medium}
          sub="Pending review"
          theme="slate"
          progress={(metrics.medium / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("medium")}
          active={statusRules["medium"] === "include"}
        />
        <KpiCard
          label="Read"
          value={metrics.read}
          sub="Seen messages"
          theme="blue"
          progress={(metrics.read / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("read")}
          active={statusRules["read"] === "include"}
        />
        <KpiCard
          label="Replied"
          value={metrics.replied}
          sub="Engaged consultants"
          theme="teal"
          progress={(metrics.replied / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("replied")}
          active={statusRules["replied"] === "include"}
        />
        <KpiCard
          label="Demo Booked"
          value={metrics.demo_booked}
          sub="Funnel success"
          theme="amber"
          progress={(metrics.demo_booked / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("demo_booked")}
          active={statusRules["demo_booked"] === "include"}
        />
        <KpiCard
          label="Conversion"
          value={`${metrics.conversion}%`}
          sub="Booked rate"
          theme="brand"
          progress={metrics.conversion}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart View */}
        <section className="lg:col-span-3 rounded-xl border bg-card p-5 shadow-card">
          <header className="mb-3">
            <h2 className="text-lg font-semibold">Franchise Outreach Funnel</h2>
            <p className="text-xs text-muted-foreground">Visualizing pipeline distribution from initial message to booked demo</p>
          </header>
          <div className="h-64">
            <Bar
              data={funnelData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, grid: { color: "#f1f5f9" } }
                },
              }}
            />
          </div>
        </section>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-slate-200/70 bg-card shadow-card overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="bg-slate-50/40 px-6 py-4.5 border-b border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-center">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, firm, region, rep..."
              className="pl-9 bg-white border-slate-200/70 hover:border-slate-300 shadow-xs placeholder:text-slate-400 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Per-status Include / Exclude Filter */}
          {(() => {
            const activeCount = Object.keys(statusRules).length;
            const summaryParts = Object.entries(statusRules).map(([s, mode]) =>
              `${mode === "exclude" ? "−" : "+"}${OUTREACH_STATUS_LABEL[s as OutreachStatus]}`
            );
            return (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-amber-50/50 border border-amber-200 border-t-[3px] border-t-amber-500 hover:border-amber-300 hover:border-t-amber-600 hover:bg-amber-100/50 shadow-xs transition-all text-amber-700 h-9 px-3"
                  >
                    <span className="truncate flex-1 text-xs">
                      {activeCount === 0 ? "All Statuses" : summaryParts.join(", ")}
                    </span>
                    {activeCount > 0 && (
                      <div role="button" onClick={(e) => { e.stopPropagation(); setStatusRules({}); }} className="ml-1 p-0.5 hover:bg-amber-100 rounded-full">
                        <X className="h-3 w-3 opacity-60 hover:opacity-100 text-amber-700" />
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 rounded-xl border border-slate-200 shadow-xl bg-white z-50" align="start">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filter by Status</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {STATUSES.map((s) => {
                      const rule = statusRules[s];
                      const setRule = (mode: "include" | "exclude" | null) => {
                        setStatusRules((prev) => { const next = { ...prev }; if (mode === null) delete next[s]; else next[s] = mode; return next; });
                      };
                      return (
                        <div key={s} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${rule === "include" ? "bg-emerald-50" : rule === "exclude" ? "bg-rose-50" : "hover:bg-slate-50"}`}>
                          <span className={`flex-1 text-xs font-semibold ${rule === "include" ? "text-emerald-700" : rule === "exclude" ? "text-rose-700" : "text-slate-600"}`}>{OUTREACH_STATUS_LABEL[s]}</span>
                          <button onClick={() => setRule(rule === "include" ? null : "include")} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${rule === "include" ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>Include</button>
                          <button onClick={() => setRule(rule === "exclude" ? null : "exclude")} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${rule === "exclude" ? "bg-rose-500 border-rose-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50"}`}>Exclude</button>
                        </div>
                      );
                    })}
                  </div>
                  {activeCount > 0 && (
                    <div className="px-2 pb-2">
                      <button onClick={() => setStatusRules({})} className="w-full text-[10px] font-semibold text-slate-400 hover:text-slate-600 py-1 rounded hover:bg-slate-50 transition-all border border-dashed border-slate-200">Clear all</button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            );
          })()}

          {/* Per-medium Include / Exclude Filter */}
          {(() => {
            const MEDIUMS = ["LinkedIn", "WhatsApp", "Email", "Call"];
            const activeCount = Object.keys(mediumRules).length;
            const summaryParts = Object.entries(mediumRules).map(([k, mode]) =>
              `${mode === "exclude" ? "−" : "+"}${k}`
            );
            return (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-blue-50/50 border border-blue-200 border-t-[3px] border-t-blue-500 hover:border-blue-300 hover:border-t-blue-600 hover:bg-blue-100/50 shadow-xs transition-all text-blue-700 h-9 px-3"
                  >
                    <span className="truncate flex-1 text-xs">
                      {activeCount === 0 ? "All Mediums" : summaryParts.join(", ")}
                    </span>
                    {activeCount > 0 && (
                      <div role="button" onClick={(e) => { e.stopPropagation(); setMediumRules({}); }} className="ml-1 p-0.5 hover:bg-blue-100 rounded-full">
                        <X className="h-3 w-3 opacity-60 hover:opacity-100 text-blue-700" />
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 rounded-xl border border-slate-200 shadow-xl bg-white z-50" align="start">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filter by Medium</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {MEDIUMS.map((m) => {
                      const rule = mediumRules[m];
                      const setRule = (mode: "include" | "exclude" | null) => {
                        setMediumRules((prev) => { const next = { ...prev }; if (mode === null) delete next[m]; else next[m] = mode; return next; });
                      };
                      return (
                        <div key={m} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${rule === "include" ? "bg-emerald-50" : rule === "exclude" ? "bg-rose-50" : "hover:bg-slate-50"}`}>
                          <span className={`flex-1 text-xs font-semibold ${rule === "include" ? "text-emerald-700" : rule === "exclude" ? "text-rose-700" : "text-slate-600"}`}>{m}</span>
                          <button onClick={() => setRule(rule === "include" ? null : "include")} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${rule === "include" ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>Include</button>
                          <button onClick={() => setRule(rule === "exclude" ? null : "exclude")} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${rule === "exclude" ? "bg-rose-500 border-rose-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50"}`}>Exclude</button>
                        </div>
                      );
                    })}
                  </div>
                  {activeCount > 0 && (
                    <div className="px-2 pb-2">
                      <button onClick={() => setMediumRules({})} className="w-full text-[10px] font-semibold text-slate-400 hover:text-slate-600 py-1 rounded hover:bg-slate-50 transition-all border border-dashed border-slate-200">Clear all</button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            );
          })()}

          {/* Per-owner Include / Exclude Filter */}
          {(() => {
            const activeCount = Object.keys(ownerRules).length;
            const summaryParts = Object.entries(ownerRules).map(([k, mode]) =>
              `${mode === "exclude" ? "−" : "+"}${k}`
            );
            return (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-indigo-50/50 border border-indigo-200 border-t-[3px] border-t-indigo-500 hover:border-indigo-300 hover:border-t-indigo-600 hover:bg-indigo-100/50 shadow-xs transition-all text-indigo-700 h-9 px-3"
                  >
                    <span className="truncate flex-1 text-xs">
                      {activeCount === 0 ? "All Owners" : summaryParts.join(", ")}
                    </span>
                    {activeCount > 0 && (
                      <div role="button" onClick={(e) => { e.stopPropagation(); setOwnerRules({}); }} className="ml-1 p-0.5 hover:bg-indigo-100 rounded-full">
                        <X className="h-3 w-3 opacity-60 hover:opacity-100 text-indigo-700" />
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 rounded-xl border border-slate-200 shadow-xl bg-white z-50" align="start">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filter by Owner</p>
                  </div>
                  <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                    {reps.map((r) => {
                      const rule = ownerRules[r.name];
                      const setRule = (mode: "include" | "exclude" | null) => {
                        setOwnerRules((prev) => { const next = { ...prev }; if (mode === null) delete next[r.name]; else next[r.name] = mode; return next; });
                      };
                      return (
                        <div key={r.name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${rule === "include" ? "bg-emerald-50" : rule === "exclude" ? "bg-rose-50" : "hover:bg-slate-50"}`}>
                          <span className={`flex-1 text-xs font-semibold ${rule === "include" ? "text-emerald-700" : rule === "exclude" ? "text-rose-700" : "text-slate-600"}`}>{r.name}</span>
                          <button onClick={() => setRule(rule === "include" ? null : "include")} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${rule === "include" ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>Include</button>
                          <button onClick={() => setRule(rule === "exclude" ? null : "exclude")} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${rule === "exclude" ? "bg-rose-500 border-rose-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50"}`}>Exclude</button>
                        </div>
                      );
                    })}
                  </div>
                  {activeCount > 0 && (
                    <div className="px-2 pb-2">
                      <button onClick={() => setOwnerRules({})} className="w-full text-[10px] font-semibold text-slate-400 hover:text-slate-600 py-1 rounded hover:bg-slate-50 transition-all border border-dashed border-slate-200">Clear all</button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            );
          })()}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Brokerage / Firm</th>
                <th className="text-left px-6 py-4">Designation</th>
                <th className="text-left px-6 py-4">Region / Location</th>
                <th className="text-left px-6 py-4">Phone</th>
                <th className="text-left px-6 py-4">Email</th>
                <th className="text-left px-6 py-4">LinkedIn</th>
                <th className="text-left px-6 py-4">Medium</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Rep (Owner)</th>
                <th className="text-left px-6 py-4">Remark</th>
                <th className="px-6 py-4 w-px text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filtered.map((c) => (
                <ConsultantRow
                  key={c.id}
                  c={c}
                  isEditMode={isEditMode}
                  reps={reps}
                  updateFranchiseConsultant={updateFranchiseConsultant}
                  deleteFranchiseConsultant={deleteFranchiseConsultant}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-5 py-16 text-center text-slate-400 font-medium bg-slate-50/20">
                    No consultants match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Consultant Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Add Franchise Consultant</DialogTitle>
            <DialogDescription>Create a new Franchise consultant entry in the outreach logs.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="company">Brokerage / Firm</Label>
                <Input
                  id="company"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="FranConnect / Self"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  placeholder="Senior Consultant"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="region">Region / Location</Label>
              <Input
                id="region"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                placeholder="North America / West Coast"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jane@franconsult.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="linkedin">LinkedIn profile URL</Label>
              <Input
                id="linkedin"
                value={newLinkedin}
                onChange={(e) => setNewLinkedin(e.target.value)}
                placeholder="linkedin.com/in/username"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="status">Outreach Status</Label>
                <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {OUTREACH_STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="medium">Contact Medium</Label>
                <Select value={newMedium} onValueChange={(val: any) => setNewMedium(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Call">Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="owner">Rep (Owner)</Label>
              <Select value={newOwner} onValueChange={setNewOwner}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reps.map((r) => (
                    <SelectItem key={r.name} value={r.name}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="remark">Remark / Notes</Label>
              <Textarea
                id="remark"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Sent introductory presentation on franchising options..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-brand text-white border-0 hover:opacity-90">
                Save Consultant
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Import Franchise Consultants</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel spreadsheet containing consultant information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border-2 border-dashed p-6 text-center cursor-pointer hover:bg-slate-50 transition relative">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Click to choose a file or drag here</p>
              <p className="text-xs text-slate-400 mt-1">Supports CSV, XLSX or XLS</p>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border">
              <p className="font-bold text-slate-700 mb-1">Expected columns:</p>
              <p className="font-mono">name *, company, designation, region, phone, email, linkedin, status, medium, owner, remark</p>
              <p className="mt-2 text-slate-400">* Column name is required. Others are optional.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

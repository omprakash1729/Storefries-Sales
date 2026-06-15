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
  UserPlus,
  Network
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { BniContact, OutreachStatus, RepColor } from "@/lib/types";
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

export const Route = createFileRoute("/bni")({
  head: () => ({
    meta: [
      { title: "BNI Contacts — Storefries Sales" },
      { name: "description", content: "Manage and track BNI contacts outreach pipeline." },
    ],
  }),
  component: BniPage,
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

const STATUS_TEXT_COLOR: Record<OutreachStatus, string> = {
  reached_out: "text-purple-600",
  medium: "text-sky-600",
  read: "text-indigo-600",
  replied: "text-teal-600",
  demo_booked: "text-emerald-600",
};

function BniStatusBadge({ status, className = "" }: { status: OutreachStatus; className?: string }) {
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

const ContactRow = memo(function ContactRow({
  c,
  isEditMode,
  reps,
  updateBniContact,
  deleteBniContact,
}: {
  c: BniContact;
  isEditMode: boolean;
  reps: any[];
  updateBniContact: (id: string, patch: Partial<BniContact>) => Promise<void>;
  deleteBniContact: (id: string) => Promise<void>;
}) {
  return (
    <tr className="hover:bg-slate-50/40 transition-colors group/row">
      <td className="px-6 py-4">
        <EditableCell
          value={c.name}
          isEditMode={isEditMode}
          onSave={(val) => updateBniContact(c.id, { name: val })}
          className="font-bold text-slate-800 text-[14px]"
        />
      </td>
      <td className="px-6 py-4 text-slate-500 font-medium">
        <EditableCell
          value={c.company ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateBniContact(c.id, { company: val || undefined })}
          displayNode={c.company ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-slate-500 font-medium">
        <EditableCell
          value={c.designation ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateBniContact(c.id, { designation: val || undefined })}
          displayNode={c.designation ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-indigo-600 font-semibold text-xs">
        <EditableCell
          value={c.bniChapter ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateBniContact(c.id, { bniChapter: val || undefined })}
          displayNode={c.bniChapter ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-slate-500 font-medium text-xs">
        <EditableCell
          value={c.phone ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateBniContact(c.id, { phone: val || undefined })}
          displayNode={c.phone ?? "—"}
        />
      </td>
      <td className="px-6 py-4 text-slate-500 font-medium text-xs">
        <EditableCell
          value={c.email ?? ""}
          isEditMode={isEditMode}
          onSave={(val) => updateBniContact(c.id, { email: val || undefined })}
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
            onSave={(val) => updateBniContact(c.id, { linkedin: val || undefined })}
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
            onChange={(e) => updateBniContact(c.id, { medium: e.target.value as any })}
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
          <BniStatusBadge status={c.status} />
        ) : (
          <select
            value={c.status}
            onChange={(e) => updateBniContact(c.id, { status: e.target.value as OutreachStatus })}
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
              onChange={(e) => updateBniContact(c.id, { owner: e.target.value })}
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
          onSave={(val) => updateBniContact(c.id, { remark: val || undefined })}
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
              deleteBniContact(c.id);
              toast.success("Contact deleted");
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </td>
    </tr>
  );
});

function BniPage() {
  const {
    bniContacts,
    reps,
    addBniContact,
    updateBniContact,
    deleteBniContact,
    importBniContacts,
  } = useStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [mediumFilter, setMediumFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newChapter, setNewChapter] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLinkedin, setNewLinkedin] = useState("");
  const [newStatus, setNewStatus] = useState<OutreachStatus>("reached_out");
  const [newMedium, setNewMedium] = useState<"LinkedIn" | "WhatsApp" | "Email" | "Call">("LinkedIn");
  const [newOwner, setNewOwner] = useState(reps[0]?.name || "Bhuvaneshwari");
  const [newRemark, setNewRemark] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bniContacts.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (mediumFilter !== "all" && c.medium !== mediumFilter) return false;
      if (ownerFilter !== "all" && c.owner !== ownerFilter) return false;
      if (
        q &&
        !(
          c.name.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.bniChapter && c.bniChapter.toLowerCase().includes(q)) ||
          c.owner.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [bniContacts, search, statusFilter, mediumFilter, ownerFilter]);

  const metrics = useMemo(() => {
    const m = {
      total: bniContacts.length,
      reached_out: 0,
      medium: 0,
      read: 0,
      replied: 0,
      demo_booked: 0,
      conversion: 0,
    };
    for (const c of bniContacts) {
      if (c.status in m) {
        m[c.status as keyof typeof m]++;
      }
    }
    m.conversion = m.total === 0 ? 0 : Math.round((m.demo_booked / m.total) * 1000) / 10;
    return m;
  }, [bniContacts]);

  const handleToggleFilter = (status: string) => {
    setStatusFilter((prev) => (prev === status ? "all" : status));
  };

  const funnelData = {
    labels: ["Reached Out", "Medium", "Read", "Replied", "Demo Booked"],
    datasets: [
      {
        label: "Contacts",
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
      toast.error("Contact name is required");
      return;
    }
    addBniContact({
      name: newName.trim(),
      company: newCompany.trim() || undefined,
      designation: newDesignation.trim() || undefined,
      bniChapter: newChapter.trim() || undefined,
      phone: newPhone.trim() || undefined,
      email: newEmail.trim() || undefined,
      linkedin: newLinkedin.trim() || undefined,
      status: newStatus,
      medium: newMedium,
      owner: newOwner,
      remark: newRemark.trim() || undefined,
    });
    toast.success("BNI contact added successfully");
    setShowAdd(false);

    // Reset Form
    setNewName("");
    setNewCompany("");
    setNewDesignation("");
    setNewChapter("");
    setNewPhone("");
    setNewEmail("");
    setNewLinkedin("");
    setNewStatus("reached_out");
    setNewMedium("LinkedIn");
    setNewRemark("");
  };

  const exportData = (rows: BniContact[], fmt: "csv" | "xlsx") => {
    const data = rows.map(({ id: _id, ...rest }) => rest);
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BNI Contacts");
    const fname = `bni-contacts-${new Date().toISOString().slice(0, 10)}.${fmt}`;
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
    toast.success(`Exported ${rows.length} contacts as ${fmt.toUpperCase()}`);
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
          bniChapter: row.bniChapter || row.bni_chapter || row.Chapter || row.chapter || undefined,
          phone: row.phone ? String(row.phone) : undefined,
          email: row.email || row.Email || undefined,
          linkedin: row.linkedin || row.LinkedIn || undefined,
          status: (row.status || row.Status || "reached_out").toLowerCase().replace(" ", "_") as OutreachStatus,
          medium: (row.medium || row.Medium || "LinkedIn") as any,
          owner: row.owner || row.Owner || reps[0]?.name || "Bhuvaneshwari",
          remark: row.remark || row.Remark || undefined,
        })).filter(x => x.name);

        if (cleanList.length === 0) {
          toast.error("No valid contacts found in sheet.");
          return;
        }

        importBniContacts(cleanList);
        setShowImport(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse file. Make sure columns match BNI Contact fields.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            BNI Contacts Outreach Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Outreach tracker and statistics for BNI members and networking events.
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
              <DropdownMenuItem onClick={() => exportData(bniContacts, "csv")}>
                Export all (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData(bniContacts, "xlsx")}>
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
            Add Contact
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
        <KpiCard
          label="Total Contacts"
          value={metrics.total}
          sub="Network audience"
          theme="indigo"
          onClick={() => setStatusFilter("all")}
          active={statusFilter === "all"}
        />
        <KpiCard
          label="Reached Out"
          value={metrics.reached_out}
          sub="Outreach initiated"
          theme="violet"
          progress={(metrics.reached_out / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("reached_out")}
          active={statusFilter === "reached_out"}
        />
        <KpiCard
          label="Medium Status"
          value={metrics.medium}
          sub="Pending review"
          theme="slate"
          progress={(metrics.medium / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("medium")}
          active={statusFilter === "medium"}
        />
        <KpiCard
          label="Read"
          value={metrics.read}
          sub="Seen messages"
          theme="blue"
          progress={(metrics.read / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("read")}
          active={statusFilter === "read"}
        />
        <KpiCard
          label="Replied"
          value={metrics.replied}
          sub="Engaged contacts"
          theme="teal"
          progress={(metrics.replied / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("replied")}
          active={statusFilter === "replied"}
        />
        <KpiCard
          label="Demo Booked"
          value={metrics.demo_booked}
          sub="Funnel success"
          theme="amber"
          progress={(metrics.demo_booked / Math.max(1, metrics.total)) * 100}
          onClick={() => handleToggleFilter("demo_booked")}
          active={statusFilter === "demo_booked"}
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
            <h2 className="text-lg font-semibold">BNI Outreach Funnel</h2>
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
              placeholder="Search by name, company, chapter, rep..."
              className="pl-9 bg-white border-slate-200/70 hover:border-slate-300 shadow-xs placeholder:text-slate-400 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-amber-50/50 border border-amber-200 border-t-[3px] border-t-amber-500 text-amber-700 hover:bg-amber-100/50 transition-all">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {OUTREACH_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mediumFilter} onValueChange={setMediumFilter}>
            <SelectTrigger className="bg-blue-50/50 border border-blue-200 border-t-[3px] border-t-blue-500 text-blue-700 hover:bg-blue-100/50 transition-all">
              <SelectValue placeholder="All Mediums" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mediums</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Call">Call</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="bg-indigo-50/50 border border-indigo-200 border-t-[3px] border-t-indigo-500 text-indigo-700 hover:bg-indigo-100/50 transition-all">
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
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Company</th>
                <th className="text-left px-6 py-4">Designation</th>
                <th className="text-left px-6 py-4">BNI Chapter</th>
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
                <ContactRow
                  key={c.id}
                  c={c}
                  isEditMode={isEditMode}
                  reps={reps}
                  updateBniContact={updateBniContact}
                  deleteBniContact={deleteBniContact}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-5 py-16 text-center text-slate-400 font-medium bg-slate-50/20">
                    No contacts match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Add BNI Contact</DialogTitle>
            <DialogDescription>Create a new BNI contact entry in the outreach logs.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Acme Inc"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  placeholder="Founder / CEO"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="chapter">BNI Chapter</Label>
              <Input
                id="chapter"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                placeholder="BNI Pioneers"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91..."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="john@example.com"
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
                placeholder="Met at weekly chapter meeting..."
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-brand text-white border-0 hover:opacity-90">
                Save Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Import BNI Contacts</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel spreadsheet containing contact information.
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
              <p className="font-mono">name *, company, designation, bniChapter, phone, email, linkedin, status, medium, owner, remark</p>
              <p className="mt-2 text-slate-400">* Column name is required. Others are optional.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

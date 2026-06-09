import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "map" | "preview";

interface FieldMapping {
  accountName: string;
  contactName: string;
  phone: string;
  designation: string;
  linkedin: string;
  remark: string;
}

const TARGET_FIELDS = [
  { key: "accountName", label: "Account / Company Name *", required: true, desc: "Required to link the contact to a company." },
  { key: "contactName", label: "Contact Name *", required: true, desc: "Required name of the contact person." },
  { key: "phone", label: "Phone Number", required: false, desc: "Optional phone number." },
  { key: "designation", label: "Designation", required: false, desc: "Optional job title or role." },
  { key: "linkedin", label: "LinkedIn URL", required: false, desc: "Optional link to LinkedIn profile." },
  { key: "remark", label: "Remark", required: false, desc: "Optional notes or personal remarks." },
] as const;

export function ImportContactsDialog({ open, onOpenChange }: Props) {
  const { importContacts, accounts } = useStore();
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({
    accountName: "",
    contactName: "",
    phone: "",
    designation: "",
    linkedin: "",
    remark: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state on close
  const handleClose = () => {
    if (isProcessing) return;
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setMapping({
      accountName: "",
      contactName: "",
      phone: "",
      designation: "",
      linkedin: "",
      remark: "",
    });
    onOpenChange(false);
  };

  // Parse Excel / CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Parse rows as raw arrays (header: 1)
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        if (rows.length < 2) {
          toast.error("File appears to be empty or has no header row.");
          return;
        }

        const parsedHeaders = rows[0].map(h => String(h || "").trim()).filter(Boolean);
        if (parsedHeaders.length === 0) {
          toast.error("No valid column headers detected in the first row.");
          return;
        }

        setHeaders(parsedHeaders);
        setRawRows(rows.slice(1));

        // Auto-mapping logic
        const initialMapping = { ...mapping };
        
        parsedHeaders.forEach((header) => {
          const hLower = header.toLowerCase();
          
          if (!initialMapping.accountName && (hLower.includes("account") || hLower.includes("company") || hLower.includes("organisation") || hLower.includes("organization") || hLower.includes("firm") || hLower.includes("business"))) {
            initialMapping.accountName = header;
          }
          if (!initialMapping.contactName && (hLower.includes("contact") || hLower.includes("name") || hLower.includes("person") || hLower.includes("lead"))) {
            if (hLower !== "company name" && hLower !== "account name") {
              initialMapping.contactName = header;
            }
          }
          if (!initialMapping.phone && (hLower.includes("phone") || hLower.includes("mobile") || hLower.includes("number") || hLower.includes("tel") || hLower.includes("contact number") || hLower.includes("telephone"))) {
            initialMapping.phone = header;
          }
          if (!initialMapping.designation && (hLower.includes("designation") || hLower.includes("role") || hLower.includes("title") || hLower.includes("job") || hLower.includes("position") || hLower.includes("post"))) {
            initialMapping.designation = header;
          }
          if (!initialMapping.linkedin && (hLower.includes("linkedin") || hLower.includes("profile") || hLower.includes("social") || hLower.includes("url") || hLower.includes("link"))) {
            if (hLower.includes("linkedin")) {
              initialMapping.linkedin = header;
            }
          }
          if (!initialMapping.remark && (hLower.includes("remark") || hLower.includes("note") || hLower.includes("comment") || hLower.includes("info") || hLower.includes("description") || hLower.includes("detail"))) {
            initialMapping.remark = header;
          }
        });

        setMapping(initialMapping);
        setStep("map");
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse file. Make sure it is a valid CSV or Excel file.");
      }
    };

    reader.readAsBinaryString(file);
  };

  // Convert raw rows into contacts using mappings
  const getMappedContacts = () => {
    const accountHeaderIndex = headers.indexOf(mapping.accountName);
    const contactHeaderIndex = headers.indexOf(mapping.contactName);
    const phoneIndex = headers.indexOf(mapping.phone);
    const designationIndex = headers.indexOf(mapping.designation);
    const linkedinIndex = headers.indexOf(mapping.linkedin);
    const remarkIndex = headers.indexOf(mapping.remark);

    const mapped = rawRows
      .map((row) => {
        const accountName = String(row[accountHeaderIndex] || "").trim();
        const contactName = String(row[contactHeaderIndex] || "").trim();
        
        if (!accountName || !contactName) return null;

        return {
          accountName,
          contactName,
          phone: phoneIndex !== -1 && row[phoneIndex] ? String(row[phoneIndex]).trim() : undefined,
          designation: designationIndex !== -1 && row[designationIndex] ? String(row[designationIndex]).trim() : undefined,
          linkedin: linkedinIndex !== -1 && row[linkedinIndex] ? String(row[linkedinIndex]).trim() : undefined,
          remark: remarkIndex !== -1 && row[remarkIndex] ? String(row[remarkIndex]).trim() : undefined,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    return mapped;
  };

  // Perform bulk import
  const handleImport = async () => {
    const mapped = getMappedContacts();
    if (mapped.length === 0) {
      toast.error("No valid contacts were parsed. Make sure Name and Account Name are mapped.");
      return;
    }

    setIsProcessing(true);
    await importContacts(mapped);
    setIsProcessing(false);
    handleClose();
  };

  // Compute summary stats for Step 3
  const mapped = getMappedContacts();
  const existingNames = new Set(accounts.map((a) => a.name.toLowerCase()));
  const uniqueImportAccounts = Array.from(new Set(mapped.map((c) => c.accountName.toLowerCase())));
  const missingAccounts = uniqueImportAccounts.filter((name) => !existingNames.has(name));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <DialogHeader className="pb-4 border-b border-slate-100 shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
            </div>
            Import Contacts
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Import multiple contacts via CSV or Excel file. Automatically create missing accounts.
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: Upload File */}
        {step === "upload" && (
          <div className="py-8 space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-10 text-center bg-slate-50/50 hover:bg-indigo-50/10 transition-all cursor-pointer flex flex-col items-center justify-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Upload className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-slate-700">Click to upload file</p>
              <p className="text-xs text-slate-400 mt-1.5">Supports CSV, Excel (.xlsx, .xls) up to 10MB</p>
            </div>
          </div>
        )}

        {/* STEP 2: Map Columns */}
        {step === "map" && (
          <div className="py-6 space-y-6">
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-950">
              <span className="font-semibold flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4 text-indigo-500" /> Loaded file: <span className="font-bold underline">{fileName}</span>
              </span>
              <button 
                onClick={() => { setStep("upload"); setFileName(""); }}
                className="text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Change File
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Map Column Names</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TARGET_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      {field.label}
                    </Label>
                    <Select
                      value={mapping[field.key as keyof FieldMapping]}
                      onValueChange={(val) => setMapping({ ...mapping, [field.key]: val === "none" ? "" : val })}
                    >
                      <SelectTrigger className="h-10 text-xs">
                        <SelectValue placeholder="Select column matching field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {!field.required && <SelectItem value="none" className="text-slate-400 italic">Do not map</SelectItem>}
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-slate-400 italic">{field.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Preview & Verify */}
        {step === "preview" && (
          <div className="py-6 space-y-6">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Import Verification Summary</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Contacts to Import</div>
                  <div className="text-xl font-extrabold text-slate-800">{mapped.length}</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-indigo-500 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Target Accounts</div>
                  <div className="text-xl font-extrabold text-slate-800">{uniqueImportAccounts.length}</div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
                <AlertCircle className={cn("h-8 w-8 shrink-0", missingAccounts.length > 0 ? "text-amber-500" : "text-slate-400")} />
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">New Accounts Created</div>
                  <div className="text-xl font-extrabold text-slate-800">{missingAccounts.length}</div>
                </div>
              </div>
            </div>

            {missingAccounts.length > 0 && (
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5"><AlertCircle className="h-4 w-4 text-amber-500" /> Auto-creating {missingAccounts.length} Accounts</p>
                <p className="text-amber-700">The following company names were not found in your accounts list and will be automatically created: <strong>{missingAccounts.join(", ")}</strong>.</p>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-700">Data Preview (First 5 Rows)</Label>
              <div className="overflow-x-auto border border-slate-200/60 rounded-xl shadow-3xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5">Company/Account</th>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Phone</th>
                      <th className="px-4 py-2.5">Designation</th>
                      <th className="px-4 py-2.5">LinkedIn</th>
                      <th className="px-4 py-2.5">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mapped.slice(0, 5).map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/40">
                        <td className="px-4 py-3 font-semibold text-slate-800">{c.accountName}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{c.contactName}</td>
                        <td className="px-4 py-3 text-slate-500">{c.phone || "—"}</td>
                        <td className="px-4 py-3 text-slate-500">{c.designation || "—"}</td>
                        <td className="px-4 py-3 text-slate-500 truncate max-w-[150px]">{c.linkedin || "—"}</td>
                        <td className="px-4 py-3 text-slate-500 italic truncate max-w-[150px]">{c.remark || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0 gap-2">
          {step !== "upload" ? (
            <Button
              variant="ghost"
              onClick={() => setStep(step === "preview" ? "map" : "upload")}
              disabled={isProcessing}
              className="text-slate-500"
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            {step === "map" && (
              <Button
                onClick={() => {
                  if (!mapping.accountName || !mapping.contactName) {
                    toast.error("Please map the required fields: Account Name and Contact Name");
                    return;
                  }
                  setStep("preview");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {step === "preview" && (
              <Button
                onClick={handleImport}
                disabled={isProcessing}
                className="bg-gradient-brand text-white border-0 hover:opacity-90 font-semibold flex items-center gap-1.5 px-6"
              >
                {isProcessing ? "Importing..." : "Confirm & Import"} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

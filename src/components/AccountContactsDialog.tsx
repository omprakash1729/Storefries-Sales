import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { AccountContact } from "@/lib/types";
import {
  Plus,
  Trash2,
  ExternalLink,
  Phone,
  User,
  Briefcase,
  Linkedin,
  MessageSquare,
  Check,
  X,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  companyName: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

// ─── Inline editable cell ─────────────────────────────────────────────────────
function EditCell({
  value,
  onSave,
  placeholder,
  isTextarea = false,
  className = "",
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  isTextarea?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = () => {
    setEditing(false);
    if (draft.trim() !== value.trim()) onSave(draft.trim());
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isTextarea) save();
    if (e.key === "Escape") cancel();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 w-full">
        {isTextarea ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            placeholder={placeholder}
            className={cn(
              "flex-1 text-xs px-2 py-1 rounded border border-primary/40 ring-2 ring-primary/10 bg-white text-slate-800 focus:outline-none resize-none",
              className
            )}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className={cn(
              "flex-1 text-xs px-2 py-1 rounded border border-primary/40 ring-2 ring-primary/10 bg-white text-slate-800 focus:outline-none",
              className
            )}
          />
        )}
        <button
          onClick={save}
          className="h-6 w-6 rounded flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shrink-0"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={cancel}
          className="h-6 w-6 rounded flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={cn(
        "cursor-pointer text-xs px-1.5 py-1 rounded hover:bg-primary/5 hover:ring-1 ring-primary/20 transition-all min-h-[28px] flex items-center",
        !value && "text-slate-300 italic",
        className
      )}
      title="Click to edit"
    >
      {value || placeholder || "—"}
    </div>
  );
}

// ─── Add Contact Form Row ─────────────────────────────────────────────────────
function AddContactForm({
  accountName,
  onDone,
}: {
  accountName: string;
  onDone: () => void;
}) {
  const addContact = useStore((s) => s.addContact);
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [remark, setRemark] = useState("");

  const submit = async () => {
    if (!contactName.trim()) {
      toast.error("Contact name is required");
      return;
    }
    await addContact({
      accountName,
      contactName: contactName.trim(),
      phone: phone.trim() || undefined,
      designation: designation.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      remark: remark.trim() || undefined,
    });
    toast.success("Contact added");
    onDone();
  };

  return (
    <div className="border border-dashed border-primary/30 rounded-xl bg-primary/2 p-4 space-y-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <Plus className="h-3.5 w-3.5" /> New Contact
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
            <User className="h-3 w-3" /> Name *
          </Label>
          <Input
            autoFocus
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Rahul Kumar"
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
            <Phone className="h-3 w-3" /> Phone
          </Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
            <Briefcase className="h-3 w-3" /> Designation
          </Label>
          <Input
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Marketing Manager"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
            <Linkedin className="h-3 w-3" /> LinkedIn URL
          </Label>
          <Input
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
          <MessageSquare className="h-3 w-3" /> Remark
        </Label>
        <Textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="e.g. Decision maker, prefers WhatsApp"
          rows={2}
          className="text-sm resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button variant="outline" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={submit}
          className="bg-gradient-brand text-white border-0 hover:opacity-90"
        >
          <Check className="h-3.5 w-3.5" /> Save Contact
        </Button>
      </div>
    </div>
  );
}

// ─── Contact Row ──────────────────────────────────────────────────────────────
function ContactRow({
  contact,
  onUpdate,
  onDelete,
}: {
  contact: AccountContact;
  onUpdate: (patch: Partial<AccountContact>) => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <tr className="group/contact hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0">
      {/* Name */}
      <td className="px-5 py-3.5 font-semibold text-slate-800 min-w-[150px]">
        <EditCell
          value={contact.contactName}
          onSave={(v) => onUpdate({ contactName: v })}
          placeholder="Name"
        />
      </td>

      {/* Phone */}
      <td className="px-5 py-3.5 min-w-[150px]">
        <EditCell
          value={contact.phone ?? ""}
          onSave={(v) => onUpdate({ phone: v || undefined })}
          placeholder="Phone"
        />
      </td>

      {/* Designation */}
      <td className="px-5 py-3.5 min-w-[160px]">
        <EditCell
          value={contact.designation ?? ""}
          onSave={(v) => onUpdate({ designation: v || undefined })}
          placeholder="Designation"
        />
      </td>

      {/* LinkedIn */}
      <td className="px-5 py-3.5 min-w-[180px]">
        <div className="flex items-center gap-1">
          <EditCell
            value={contact.linkedin ?? ""}
            onSave={(v) => onUpdate({ linkedin: v || undefined })}
            placeholder="LinkedIn URL"
            className="flex-1"
          />
          {contact.linkedin && (
            <a
              href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-6 w-6 rounded flex items-center justify-center bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors shrink-0 ml-1"
              title="Open LinkedIn profile"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </td>

      {/* Remark */}
      <td className="px-5 py-3.5 min-w-[180px]">
        <EditCell
          value={contact.remark ?? ""}
          onSave={(v) => onUpdate({ remark: v || undefined })}
          placeholder="Add a remark…"
          isTextarea
          className="text-slate-500 italic"
        />
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5 text-right w-px whitespace-nowrap">
        {confirmDelete ? (
          <div className="flex items-center gap-1 justify-end">
            <span className="text-xs text-rose-500 font-medium">Delete?</span>
            <button
              onClick={onDelete}
              className="h-6 px-2 rounded text-xs bg-rose-500 text-white hover:bg-rose-600 transition-colors font-medium"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="h-6 px-2 rounded text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="opacity-0 group-hover/contact:opacity-100 h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all ml-auto"
            title="Delete contact"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────
export function AccountContactsDialog({ companyName, open, onOpenChange }: Props) {
  const { contacts, addContact, updateContact, deleteContact } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);

  const companyContacts = contacts.filter(
    (c) => c.accountName.toLowerCase() === companyName?.toLowerCase()
  );

  const handleClose = () => {
    setShowAddForm(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-[95vw] md:w-[90vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                {companyName}
              </DialogTitle>
              <DialogDescription className="mt-1 text-slate-500">
                {companyContacts.length === 0
                  ? "No contacts yet — add the first one below"
                  : `${companyContacts.length} contact${companyContacts.length !== 1 ? "s" : ""} · click any cell to edit`}
              </DialogDescription>
            </div>
            {!showAddForm && (
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-brand text-white border-0 hover:opacity-90 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Add Contact
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Add form */}
          {showAddForm && companyName && (
            <div className="p-6 border-b border-slate-100 bg-slate-50/40">
              <AddContactForm
                accountName={companyName}
                onDone={() => setShowAddForm(false)}
              />
            </div>
          )}

          {/* Contacts table */}
          {companyContacts.length > 0 ? (
            <div className="px-8 pb-8 pt-4">
              <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-xs">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200/60 sticky top-0 z-10">
                    <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/80">
                      <th className="text-left px-5 py-4 font-bold">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" /> Name
                        </span>
                      </th>
                      <th className="text-left px-5 py-4 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone
                        </span>
                      </th>
                      <th className="text-left px-5 py-4 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Designation
                        </span>
                      </th>
                      <th className="text-left px-5 py-4 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Linkedin className="h-3.5 w-3.5 text-slate-400" /> LinkedIn
                        </span>
                      </th>
                      <th className="text-left px-5 py-4 font-bold">
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Remark
                        </span>
                      </th>
                      <th className="px-5 py-4 w-px" />
                    </tr>
                  </thead>
                  <tbody>
                    {companyContacts.map((contact) => (
                      <ContactRow
                        key={contact.id}
                        contact={contact}
                        onUpdate={(patch) => updateContact(contact.id, patch)}
                        onDelete={() => {
                          deleteContact(contact.id);
                          toast.success("Contact deleted");
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            !showAddForm && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">No contacts added yet</p>
                <p className="text-xs text-slate-400 mb-5 max-w-xs">
                  Add contacts for this account — name, phone, designation, LinkedIn and individual remarks.
                </p>
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-brand text-white border-0 hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" /> Add First Contact
                </Button>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

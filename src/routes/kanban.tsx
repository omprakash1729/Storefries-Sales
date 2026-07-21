import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { LEAD_STAGE_LABEL, LeadStage } from "@/lib/types";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, CalendarIcon, MoreHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { RepAvatar } from "@/components/dashboard-utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/kanban")({
  component: KanbanPage,
});

const LEAD_STAGES: LeadStage[] = [
  "identify_account",
  "active_platform_check",
  "initial_contact",
  "social_engagement",
  "first_email_whatsapp",
  "cold_call",
  "demo",
  "newsletter",
  "onboarding",
];

function KanbanPage() {
  const { accounts, reps, updateAccount, setActiveCompanyTimeline } = useStore();
  const [search, setSearch] = useState("");
  const [draggedAccountId, setDraggedAccountId] = useState<string | null>(null);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter((a) => {
      if (!a.name.toLowerCase().includes(q) && !a.owner.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [accounts, search]);

  // Group accounts by stage
  const columns = useMemo(() => {
    const map = new Map<LeadStage | "unassigned", typeof accounts>();
    
    // Initialize columns
    LEAD_STAGES.forEach((stage) => map.set(stage, []));
    map.set("unassigned", []);

    filteredAccounts.forEach((acc) => {
      const stage = acc.leadStage ?? "unassigned";
      const col = map.get(stage);
      if (col) {
        col.push(acc);
      } else {
        map.get("unassigned")!.push(acc);
      }
    });

    return map;
  }, [filteredAccounts]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAccountId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStage: LeadStage | "unassigned") => {
    e.preventDefault();
    const accountId = e.dataTransfer.getData("text/plain");
    
    if (accountId && targetStage !== "unassigned") {
      updateAccount(accountId, { leadStage: targetStage });
      toast.success("Lead stage updated");
    } else if (accountId && targetStage === "unassigned") {
      updateAccount(accountId, { leadStage: undefined });
      toast.success("Account removed from pipeline stages");
    }
    
    setDraggedAccountId(null);
  };

  const handleDragEnd = () => {
    setDraggedAccountId(null);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50/50">
      <div className="px-6 py-4 flex-shrink-0 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 bg-white">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Pipeline Kanban</h1>
          <p className="text-xs text-muted-foreground">
            Drag and drop accounts across the cold calling procedure stages.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search company or owner..."
              className="pl-8 h-9 text-xs bg-slate-50 border-slate-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-6">
        <div className="flex gap-4 h-full min-w-max pb-4">
          
          {/* Render Columns */}
          {["unassigned", ...LEAD_STAGES].map((stageOrUnassigned) => {
            const isUnassigned = stageOrUnassigned === "unassigned";
            const stage = stageOrUnassigned as LeadStage;
            const items = columns.get(isUnassigned ? "unassigned" : stage) || [];
            
            return (
              <div
                key={stageOrUnassigned}
                className="flex flex-col w-[320px] shrink-0 bg-slate-100/50 rounded-xl border border-slate-200/60 overflow-hidden shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, isUnassigned ? "unassigned" : stage)}
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-slate-200/50 bg-slate-100/80 flex items-center justify-between">
                  <h3 className="font-bold text-[13px] text-slate-700 truncate">
                    {isUnassigned ? "Unassigned" : LEAD_STAGE_LABEL[stage]}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 shadow-3xs">
                    {items.length}
                  </span>
                </div>

                {/* Column Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                  {items.map((acc) => (
                    <div
                      key={acc.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, acc.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setActiveCompanyTimeline(acc.name)}
                      className={cn(
                        "bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 transition-all group relative",
                        draggedAccountId === acc.id && "opacity-50 scale-95 border-dashed"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                          {acc.name}
                        </h4>
                        <button className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={acc.status} />
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <RepAvatar name={acc.owner} />
                            <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[80px]">
                              {acc.owner}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-slate-50 px-1.5 py-0.5 rounded">
                            <CalendarIcon className="h-3 w-3" />
                            {acc.month}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {items.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-[11px] font-medium text-slate-400 border-2 border-dashed border-slate-200/60 rounded-xl">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface MonthFilterProps {
  months: string[];
  selected: string[];
  onChange: (months: string[]) => void;
  className?: string;
}

export function MonthFilter({ months, selected, onChange, className }: MonthFilterProps) {
  const [open, setOpen] = useState(false);

  const isAll = selected.length === 0;

  const toggleMonth = (month: string) => {
    if (selected.includes(month)) {
      onChange(selected.filter((m) => m !== month));
    } else {
      onChange([...selected, month]);
    }
  };

  const clear = () => {
    onChange([]);
  };

  const displayText = isAll 
    ? "All Months" 
    : selected.length === 1 
      ? selected[0] 
      : `${selected.length} Months`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[180px] justify-between px-3 font-normal border-slate-200 shadow-sm hover:bg-slate-50/50 group",
            !isAll && "border-primary/30 bg-primary/5 font-medium text-primary hover:bg-primary/10",
            className
          )}
        >
          <span className="truncate pr-2">{displayText}</span>
          <div className="flex items-center gap-1">
            {!isAll && (
              <div 
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                className="p-0.5 rounded-full hover:bg-primary/20 text-primary/70 group-hover:text-primary"
              >
                <X className="h-3 w-3" />
              </div>
            )}
            <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform duration-200", open && "rotate-180")} />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-1.5 rounded-xl shadow-elevated border border-slate-100" align="end" sideOffset={8}>
        <div className="space-y-0.5">
          <button
            onClick={() => {
              clear();
            }}
            className={cn(
              "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-9 text-sm font-medium outline-none transition-colors hover:bg-slate-100/80 active:bg-slate-200/50 text-slate-700",
              isAll && "bg-indigo-50/50 text-primary hover:bg-indigo-50/80"
            )}
          >
            <span className="truncate">All Months</span>
            {isAll && (
              <span className="absolute right-3 flex h-4 w-4 items-center justify-center">
                <Check className="h-4 w-4" />
              </span>
            )}
          </button>
          
          <Separator className="my-1 opacity-50" />
          
          <div className="max-h-64 overflow-y-auto px-0.5 py-0.5 custom-scrollbar">
            {months.map((month) => {
              const isSelected = selected.includes(month);
              return (
                <button
                  key={month}
                  onClick={() => toggleMonth(month)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-3 pr-9 text-sm font-medium outline-none transition-all duration-150 mt-0.5",
                    isSelected 
                      ? "bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50/80 font-semibold" 
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:bg-slate-100"
                  )}
                >
                  <span className="truncate">{month}</span>
                  {isSelected && (
                    <span className="absolute right-3 flex h-4 w-4 items-center justify-center animate-in zoom-in-75 duration-200">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

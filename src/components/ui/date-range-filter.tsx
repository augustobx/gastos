"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format, startOfYear, endOfYear } from "date-fns";

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentFrom = searchParams.get("from");
  const currentTo = searchParams.get("to");

  // Local state for custom range
  const [customFrom, setCustomFrom] = useState(currentFrom || "");
  const [customTo, setCustomTo] = useState(currentTo || "");

  useEffect(() => {
    setCustomFrom(currentFrom || "");
    setCustomTo(currentTo || "");
  }, [currentFrom, currentTo, open]);

  const applyRange = (from: string, to: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (from && to) {
      params.set("from", from);
      params.set("to", to);
    } else {
      params.delete("from");
      params.delete("to");
    }
    setOpen(false);
    router.push(`?${params.toString()}`);
  };

  const setThisMonth = () => {
    const now = new Date();
    applyRange(format(startOfMonth(now), "yyyy-MM-dd"), format(endOfMonth(now), "yyyy-MM-dd"));
  };

  const setLastMonth = () => {
    const lastMonth = subMonths(new Date(), 1);
    applyRange(format(startOfMonth(lastMonth), "yyyy-MM-dd"), format(endOfMonth(lastMonth), "yyyy-MM-dd"));
  };

  const setThisYear = () => {
    const now = new Date();
    applyRange(format(startOfYear(now), "yyyy-MM-dd"), format(endOfYear(now), "yyyy-MM-dd"));
  };

  const setAllTime = () => {
    applyRange("", "");
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      applyRange(customFrom, customTo);
    }
  };

  let displayLabel = "Este Mes";
  if (!currentFrom && !currentTo) {
    displayLabel = "Histórico";
  } else if (currentFrom && currentTo) {
    displayLabel = `${currentFrom} al ${currentTo}`;
    // Intentar simplificar el texto
    const now = new Date();
    if (currentFrom === format(startOfMonth(now), "yyyy-MM-dd") && currentTo === format(endOfMonth(now), "yyyy-MM-dd")) {
      displayLabel = "Este Mes";
    } else {
      const lastMonth = subMonths(now, 1);
      if (currentFrom === format(startOfMonth(lastMonth), "yyyy-MM-dd") && currentTo === format(endOfMonth(lastMonth), "yyyy-MM-dd")) {
        displayLabel = "Mes Anterior";
      } else if (currentFrom === format(startOfYear(now), "yyyy-MM-dd") && currentTo === format(endOfYear(now), "yyyy-MM-dd")) {
        displayLabel = "Este Año";
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-xl hover:bg-muted/50 transition-colors bg-card">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="truncate max-w-[120px] sm:max-w-none">{displayLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </button>
        } 
      />
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Filtrar por Fecha</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Rápidos</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={setThisMonth} className="px-3 py-2 text-sm border rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left font-medium">Este Mes</button>
              <button onClick={setLastMonth} className="px-3 py-2 text-sm border rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left font-medium">Mes Anterior</button>
              <button onClick={setThisYear} className="px-3 py-2 text-sm border rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left font-medium">Este Año</button>
              <button onClick={setAllTime} className="px-3 py-2 text-sm border rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left font-medium">Todo el Historial</button>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Rango Específico</p>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background" 
              />
              <span className="text-muted-foreground text-sm">a</span>
              <input 
                type="date" 
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background" 
              />
            </div>
            <button 
              onClick={handleCustomApply}
              disabled={!customFrom || !customTo}
              className="w-full mt-2 px-4 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Aplicar Rango
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

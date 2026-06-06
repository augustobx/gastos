"use client";

import { Transaction, Category } from "@prisma/client";
import { ArrowUpRight, ArrowDownRight, Tag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { categorizeTransaction } from "@/app/actions/transactions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function ClassifierItem({ transaction: tx, categories, index }: { transaction: Transaction, categories: Category[], index: number }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isIncome = tx.type === "INCOME";

  const handleCategorize = async (categoryId: string | null) => {
    if (!categoryId) return;
    setIsUpdating(true);
    try {
      await categorizeTransaction(tx.id, categoryId === "none" ? null : categoryId);
    } catch (e) {
      console.error(e);
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-all hover:bg-muted/30",
        isUpdating && "opacity-50 pointer-events-none"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={cn(
          "shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
          isIncome
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
        )}>
          {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground truncate">
            {tx.description || (isIncome ? "Ingreso" : "Gasto")}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "text-sm font-bold tabular-nums",
              isIncome ? "text-emerald-500" : "text-rose-500"
            )}>
              {isIncome ? "+" : "−"}${tx.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground capitalize">
              {new Date(tx.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
            </span>
            {tx.source === "mercadopago" && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[10px] font-semibold tracking-wider text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md uppercase">
                  MP
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 w-full sm:w-auto flex items-center gap-2">
        <div className="w-full sm:w-[200px]">
          <Select disabled={isUpdating} onValueChange={handleCategorize}>
            <SelectTrigger className="w-full h-11 rounded-xl bg-muted/50 border-border/50 hover:bg-muted focus:ring-primary shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="w-4 h-4" />
                <SelectValue placeholder="Elegir Categoría..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="font-medium">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <button
          onClick={async () => {
            if (confirm("¿Eliminar este movimiento?")) {
              setIsUpdating(true);
              try {
                const { deleteTransaction } = await import("@/app/actions/transactions");
                await deleteTransaction(tx.id);
              } catch (e) {
                console.error(e);
                setIsUpdating(false);
              }
            }
          }}
          disabled={isUpdating}
          className="shrink-0 p-2.5 h-11 w-11 flex items-center justify-center rounded-xl border border-border/50 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-colors disabled:opacity-50"
          title="Eliminar movimiento"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { Transaction, Category } from "@prisma/client";
import { ArrowDownRight, ArrowUpRight, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { deleteTransaction } from "@/app/actions/transactions";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { Pencil } from "lucide-react";

type TransactionWithCategory = Transaction & { category: Category | null };

export function TransactionList({ 
  transactions, 
  categories,
  compact = false 
}: { 
  transactions: TransactionWithCategory[];
  categories: Category[];
  compact?: boolean;
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
          <MoreHorizontal className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No hay movimientos</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Los movimientos que registres aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border divide-y divide-border/50 overflow-hidden">
      {transactions.map((tx, i) => {
        const isIncome = tx.type === "INCOME";
        return (
          <div 
            key={tx.id} 
            className={cn(
              "flex items-center justify-between px-4 py-3.5 group transition-colors hover:bg-muted/30",
              compact && "px-4 py-3"
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={cn(
                "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
                isIncome 
                  ? "bg-emerald-500/10 text-emerald-500" 
                  : "bg-rose-500/10 text-rose-500"
              )}>
                {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {tx.description || (isIncome ? "Ingreso" : "Gasto")}
                </p>
                {tx.notes && (
                  <p className="text-xs text-muted-foreground/80 truncate mt-0.5">
                    {tx.notes}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">
                    {format(new Date(tx.date), "d MMM yyyy", { locale: es })}
                  </span>
                  {tx.category && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                        {tx.category.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className={cn(
                "text-sm font-semibold tabular-nums",
                isIncome ? "text-emerald-500" : "text-foreground"
              )}>
                {isIncome ? "+" : "−"}${tx.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                <AddTransactionDialog 
                  categories={categories}
                  initialData={tx}
                  trigger={
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  }
                />
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar este movimiento?")) {
                      deleteTransaction(tx.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { FixedTransaction, Category, Transaction } from "@prisma/client";
import { ArrowDownRight, ArrowUpRight, Trash2, CalendarDays, MoreHorizontal, CheckCircle2, XCircle, Pencil, Check } from "lucide-react";
import { deleteFixedTransaction, payFixedTransaction, unpayFixedTransaction } from "@/app/actions/fixed";
import { cn } from "@/lib/utils";
import { AddFixedTransactionDialog } from "@/components/transactions/AddFixedTransactionDialog";

type FixedTransactionWithCategoryAndTx = FixedTransaction & { 
  category: Category | null;
  transactions: Transaction[]; 
};

export function FixedTransactionList({ 
  transactions,
  categories
}: { 
  transactions: FixedTransactionWithCategoryAndTx[];
  categories: Category[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
          <MoreHorizontal className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No hay movimientos fijos</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Registra tus gastos e ingresos recurrentes</p>
      </div>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return (
    <div className="bg-card rounded-2xl border divide-y divide-border/50 overflow-hidden">
      {transactions.map((tx, i) => {
        const isIncome = tx.type === "INCOME";
        
        // Find if there's a transaction for this month
        const currentMonthTx = tx.transactions.find(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const isPaidThisMonth = !!currentMonthTx;

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between px-4 py-3.5 group transition-colors hover:bg-muted/30"
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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tx.description || (isIncome ? "Ingreso Fijo" : "Gasto Fijo")}
                  </p>
                  {tx.isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CalendarDays className="w-3 h-3 text-muted-foreground/50" />
                  <span className="text-[11px] text-muted-foreground">
                    Día {tx.dayOfMonth} de cada mes
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
                <button
                  onClick={async () => {
                    if (isPaidThisMonth) {
                      await unpayFixedTransaction(currentMonthTx.id);
                    } else {
                      await payFixedTransaction(tx.id, new Date());
                    }
                  }}
                  title={isPaidThisMonth ? "Marcar como NO pagado" : "Marcar como pagado"}
                  className={cn(
                    "p-1.5 rounded-lg flex items-center justify-center border transition-all",
                    isPaidThisMonth 
                      ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/20" 
                      : "bg-transparent border-muted-foreground/30 text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-500"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <AddFixedTransactionDialog 
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
                    if (confirm("¿Eliminar este movimiento fijo?")) {
                      deleteFixedTransaction(tx.id);
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

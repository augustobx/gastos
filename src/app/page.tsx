import { getTransactions } from "@/app/actions/transactions";
import { getFixedTransactions } from "@/app/actions/fixed";
import { getCategories } from "@/app/actions/categories";
import { verifySession } from "@/lib/session";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { MpMinimalSyncButton } from "@/components/mercadopago/MpMinimalSyncButton";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await verifySession();
  const allTransactions = await getTransactions();
  const fixedTransactions = await getFixedTransactions();
  const categories = await getCategories();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTxs = allTransactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = monthTxs.filter(tx => tx.type === "INCOME").reduce((acc, tx) => acc + tx.amount, 0);
  const expense = monthTxs.filter(tx => tx.type === "EXPENSE").reduce((acc, tx) => acc + tx.amount, 0);

  // Total accumulated balance across all time
  const totalIncome = allTransactions.filter(tx => tx.type === "INCOME").reduce((acc, tx) => acc + tx.amount, 0);
  const totalExpense = allTransactions.filter(tx => tx.type === "EXPENSE").reduce((acc, tx) => acc + tx.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  // Fixed totals
  const fixedIncome = fixedTransactions.filter(ft => ft.type === "INCOME" && ft.isActive).reduce((acc, ft) => acc + ft.amount, 0);
  const fixedExpense = fixedTransactions.filter(ft => ft.type === "EXPENSE" && ft.isActive).reduce((acc, ft) => acc + ft.amount, 0);

  const recentTxs = allTransactions.slice(0, 7);
  const monthName = now.toLocaleString("es-AR", { month: "long" });

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Buenos días, {session?.name?.split(" ")[0] || session?.username} 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Resumen de <span className="capitalize font-medium text-foreground">{monthName} {currentYear}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MpMinimalSyncButton />
          <AddTransactionDialog categories={categories} />
        </div>
      </div>

      {/* Uncategorized Alert */}
      {allTransactions.filter(tx => !tx.categoryId).length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
            <div className="p-2 bg-amber-500/20 rounded-full">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Tenés {allTransactions.filter(tx => !tx.categoryId).length} movimientos sin clasificar</p>
              <p className="text-xs opacity-80 mt-0.5">Clasificalos para mantener tus métricas exactas.</p>
            </div>
          </div>
          <Link href="/classifier" className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl text-center transition-colors shadow-sm shadow-amber-500/20">
            Clasificar Ahora
          </Link>
        </div>
      )}

      {/* Balance Card - Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 md:p-8 text-white shadow-xl shadow-emerald-600/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            Balance Total Acumulado
          </div>
          <p className="text-4xl md:text-5xl font-bold tracking-tight">
            ${totalBalance.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white/70">Flujo de este mes:</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="font-medium">${income.toLocaleString("es-AR", { minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span className="font-medium">${expense.toLocaleString("es-AR", { minimumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card rounded-2xl border p-4 md:p-5 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ingresos</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold text-emerald-500 tracking-tight">
            ${income.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-muted-foreground">{monthTxs.filter(t => t.type === "INCOME").length} movimientos</p>
        </div>

        <div className="bg-card rounded-2xl border p-4 md:p-5 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gastos</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold text-rose-500 tracking-tight">
            ${expense.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-muted-foreground">{monthTxs.filter(t => t.type === "EXPENSE").length} movimientos</p>
        </div>

        <div className="bg-card rounded-2xl border p-4 md:p-5 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fijos +</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10">
              <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold text-sky-500 tracking-tight">
            ${fixedIncome.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-muted-foreground">Ingresos recurrentes</p>
        </div>

        <div className="bg-card rounded-2xl border p-4 md:p-5 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fijos −</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-bold text-amber-500 tracking-tight">
            ${fixedExpense.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-muted-foreground">Gastos recurrentes</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Últimos Movimientos</h3>
          <Link href="/transactions" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            Ver todos →
          </Link>
        </div>
        <TransactionList transactions={recentTxs} categories={categories} compact />
      </div>
    </div>
  );
}

import { getTransactions, categorizeTransaction } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { verifySession } from "@/lib/session";
import { ArrowUpRight, ArrowDownRight, Sparkles, Inbox } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ClassifierItem } from "./ClassifierItem";

export default async function ClassifierPage() {
  const session = await verifySession();
  if (!session) return null;

  const allTransactions = await getTransactions();
  const categories = await getCategories();

  const unclassified = allTransactions.filter(tx => !tx.categoryId);

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-[800px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6 text-amber-500" />
            Bandeja de Entrada
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Clasificá tus movimientos para mantener tus gráficos ordenados.
          </p>
        </div>
      </div>

      {unclassified.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold">¡Todo al día!</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            No tenés movimientos pendientes de clasificar. Tus métricas están perfectas.
          </p>
          <Link href="/" className="mt-8 px-6 py-3 bg-primary text-white font-semibold rounded-xl transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
            Volver al Inicio
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border divide-y divide-border/50 overflow-hidden">
          {unclassified.map((tx, i) => (
            <ClassifierItem key={tx.id} transaction={tx} categories={categories} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

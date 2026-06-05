import { getFixedTransactions } from "@/app/actions/fixed";
import { getCategories } from "@/app/actions/categories";
import { FixedTransactionList } from "@/components/transactions/FixedTransactionList";
import { AddFixedTransactionDialog } from "@/components/transactions/AddFixedTransactionDialog";

export default async function FixedTransactionsPage() {
  const fixedTransactions = await getFixedTransactions();
  const categories = await getCategories();

  const totalActive = fixedTransactions.filter(ft => ft.isActive).length;

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Movimientos Fijos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalActive} activos de {fixedTransactions.length} registrados
          </p>
        </div>
        <AddFixedTransactionDialog categories={categories} />
      </div>

      <FixedTransactionList transactions={fixedTransactions as any} categories={categories} />
    </div>
  );
}

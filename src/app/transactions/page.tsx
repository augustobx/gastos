import { getTransactions } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  const categories = await getCategories();

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Movimientos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {transactions.length} movimientos registrados
          </p>
        </div>
        <AddTransactionDialog categories={categories} />
      </div>

      <TransactionList transactions={transactions} categories={categories} />
    </div>
  );
}

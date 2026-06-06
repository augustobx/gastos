import { getTransactions } from "@/app/actions/transactions";
import { getCategories } from "@/app/actions/categories";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { CategoryFilter } from "@/components/ui/category-filter";
import { startOfMonth, endOfMonth, parseISO, isAfter, isBefore, isEqual, startOfDay, endOfDay } from "date-fns";

export default async function TransactionsPage(props: { searchParams: Promise<{ from?: string, to?: string, category?: string }> }) {
  const searchParams = await props.searchParams;
  const allTransactions = await getTransactions();
  const categories = await getCategories();

  const now = new Date();
  
  // Determine date range
  let fromDate = startOfMonth(now);
  let toDate = endOfMonth(now);
  let isHistoric = false;

  if (searchParams.from && searchParams.to) {
    fromDate = startOfDay(parseISO(searchParams.from));
    toDate = endOfDay(parseISO(searchParams.to));
  } else if (searchParams.from === "" && searchParams.to === "") {
    // Empty strings = Historic (all time)
    isHistoric = true;
  }

  const selectedCategoryId = searchParams.category;

  const dateFilteredTxs = allTransactions.filter(tx => {
    if (isHistoric) return true;
    const d = new Date(tx.date);
    return (isAfter(d, fromDate) || isEqual(d, fromDate)) && (isBefore(d, toDate) || isEqual(d, toDate));
  });

  const transactions = dateFilteredTxs.filter(tx => {
    if (!selectedCategoryId) return true;
    return tx.categoryId === selectedCategoryId;
  });

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Movimientos</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            {transactions.length} movimientos encontrados
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <DateRangeFilter />
            <CategoryFilter categories={categories} />
          </div>
        </div>
        <AddTransactionDialog categories={categories} />
      </div>

      <TransactionList transactions={transactions as any} categories={categories} />
    </div>
  );
}

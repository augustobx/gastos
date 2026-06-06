"use client";

import { useMemo } from "react";
import { Transaction, Category } from "@prisma/client";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

type TransactionWithCategory = Transaction & { category: Category | null };

export function DashboardCharts({
  transactions, // filtered by date AND category (if selected)
  dateFilteredTxs, // filtered by date ONLY
  categories,
  selectedCategoryId
}: {
  transactions: TransactionWithCategory[];
  dateFilteredTxs: TransactionWithCategory[];
  categories: Category[];
  selectedCategoryId?: string;
}) {
  
  // 1. Data for General Income vs Expense Bar Chart
  const flowData = useMemo(() => {
    if (selectedCategoryId) return []; // Not needed when individual

    const grouped: Record<string, { date: string; label: string; income: number; expense: number }> = {};

    dateFilteredTxs.forEach((tx) => {
      const dateStr = format(new Date(tx.date), "yyyy-MM-dd");
      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: dateStr,
          label: format(new Date(tx.date), "d MMM", { locale: es }),
          income: 0,
          expense: 0,
        };
      }
      if (tx.type === "INCOME") grouped[dateStr].income += tx.amount;
      if (tx.type === "EXPENSE") grouped[dateStr].expense += tx.amount;
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [dateFilteredTxs, selectedCategoryId]);

  // 2. Data for General Category Distribution Pie Chart
  const pieData = useMemo(() => {
    if (selectedCategoryId) return [];

    const grouped: Record<string, { name: string; value: number; color: string }> = {};

    dateFilteredTxs
      .filter((tx) => tx.type === "EXPENSE" && tx.categoryId)
      .forEach((tx) => {
        if (!tx.categoryId || !tx.category) return;
        if (!grouped[tx.categoryId]) {
          grouped[tx.categoryId] = {
            name: tx.category.name,
            value: 0,
            color: tx.category.color || "#94a3b8", // fallback color
          };
        }
        grouped[tx.categoryId].value += tx.amount;
      });

    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [dateFilteredTxs, selectedCategoryId]);

  // 3. Data for Individual Category Trend Line Chart
  const trendData = useMemo(() => {
    if (!selectedCategoryId) return [];

    const grouped: Record<string, { date: string; label: string; amount: number }> = {};

    transactions.forEach((tx) => {
      const dateStr = format(new Date(tx.date), "yyyy-MM-dd");
      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: dateStr,
          label: format(new Date(tx.date), "d MMM", { locale: es }),
          amount: 0,
        };
      }
      grouped[dateStr].amount += tx.amount;
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, selectedCategoryId]);

  const COLORS = ["#10b981", "#f43f5e", "#0ea5e9", "#f59e0b", "#8b5cf6", "#14b8a6", "#ec4899"];

  if (!dateFilteredTxs.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      {!selectedCategoryId ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Flujo de Ingresos vs Egresos
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString("es-AR")}`, ""]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Distribución de Gastos
            </h3>
            <div className="h-[300px] w-full">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color !== "#94a3b8" ? entry.color : COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString("es-AR")}`, ""]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  No hay gastos categorizados para mostrar.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Evolución Temporal de la Categoría
          </h3>
          <div className="h-[300px] w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString("es-AR")}`, "Monto"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0ea5e9" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No hay movimientos para esta categoría en las fechas seleccionadas.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { createFixedTransaction, updateFixedTransaction } from "@/app/actions/fixed";
import { Category, FixedTransaction } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fixedTransactionSchema } from "@/lib/schemas";
import { AddCategoryDialog } from "@/components/categories/AddCategoryDialog";
import { z } from "zod";
import { cn } from "@/lib/utils";

type FormData = z.infer<typeof fixedTransactionSchema>;

export function AddFixedTransactionDialog({ categories, initialData, trigger }: { categories: Category[], initialData?: FixedTransaction, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE">(initialData?.type || "EXPENSE");
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(fixedTransactionSchema) as any,
    defaultValues: {
      type: initialData?.type || "EXPENSE",
      isActive: initialData ? initialData.isActive : true,
      dayOfMonth: initialData?.dayOfMonth || 1,
      amount: initialData?.amount,
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || undefined,
      totalInstallments: initialData?.totalInstallments || undefined,
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (initialData) {
        await updateFixedTransaction(initialData.id, data);
      } else {
        await createFixedTransaction(data);
      }
      setOpen(false);
      if (!initialData) {
        reset();
        setTxType("EXPENSE");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        trigger ? (trigger as React.ReactElement) : (
          <button className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" /> Nuevo Fijo
          </button>
        )
      } />
      <DialogContent className="sm:max-w-[420px] rounded-2xl border-border/50 p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{initialData ? "Editar Movimiento Fijo" : "Nuevo Movimiento Fijo"}</DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-5 space-y-5">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl">
            <button
              type="button"
              onClick={() => { setTxType("EXPENSE"); setValue("type", "EXPENSE"); }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                txType === "EXPENSE" 
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/25" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowDownRight className="w-4 h-4" /> Gasto
            </button>
            <button
              type="button"
              onClick={() => { setTxType("INCOME"); setValue("type", "INCOME"); }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
                txType === "INCOME" 
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ArrowUpRight className="w-4 h-4" /> Ingreso
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input 
                className="pl-7 h-12 text-lg font-semibold rounded-xl bg-muted/30 border-border/50 focus:bg-background" 
                id="amount" 
                type="number" 
                step="0.01" 
                {...register("amount", { valueAsNumber: true })} 
                placeholder="0.00" 
              />
            </div>
            {errors.amount && <p className="text-rose-500 text-xs">{errors.amount.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción</Label>
            <Input 
              className="h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-background" 
              id="description" 
              {...register("description")} 
              placeholder="Ej. Netflix, Alquiler..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Día del mes</Label>
              <Input 
                className="h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-background" 
                id="dayOfMonth" 
                type="number" 
                min="1" 
                max="31" 
                {...register("dayOfMonth", { valueAsNumber: true })} 
                defaultValue={initialData?.dayOfMonth || 1} 
              />
              {errors.dayOfMonth && <p className="text-rose-500 text-xs">{errors.dayOfMonth.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalInstallments" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cuotas Totales (Opcional)</Label>
              <Input 
                className="h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-background" 
                id="totalInstallments" 
                type="number" 
                min="1" 
                {...register("totalInstallments", { valueAsNumber: true })} 
                placeholder="Ej. 12" 
                defaultValue={initialData?.totalInstallments || ""}
              />
              {errors.totalInstallments && <p className="text-rose-500 text-xs">{errors.totalInstallments.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="categoryId" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoría</Label>
                <AddCategoryDialog 
                  trigger={
                    <button type="button" className="text-[11px] font-semibold text-primary hover:underline">
                      Crear nueva
                    </button>
                  }
                />
              </div>
              <Select defaultValue={initialData?.categoryId || undefined} onValueChange={(val: string | null) => setValue("categoryId", val === "none" || !val ? undefined : val)}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-border/50">
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className={cn(
              "w-full h-11 rounded-xl font-semibold text-sm transition-all shadow-lg",
              txType === "INCOME" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" 
                : "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
            )}
          >
            {isSubmitting ? "Guardando..." : "Guardar Fijo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

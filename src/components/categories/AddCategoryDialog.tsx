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
import { Plus } from "lucide-react";
import { createCategory } from "@/app/actions/categories";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@/lib/schemas";
import { z } from "zod";

type FormData = z.infer<typeof categorySchema>;

export function AddCategoryDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(categorySchema) as any,
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createCategory(data);
      setOpen(false);
      reset();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        trigger ? (trigger as React.ReactElement) : (
          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Nueva Categoría
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-border/50 p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Nueva Categoría</DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</Label>
            <Input 
              className="h-11 rounded-xl bg-muted/30 border-border/50 focus:bg-background" 
              id="name" 
              {...register("name")} 
              placeholder="Ej. Supermercado, Alquiler..." 
            />
            {errors.name && <p className="text-rose-500 text-xs">{errors.name.message as string}</p>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-11 rounded-xl font-semibold text-sm transition-all shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 mt-2"
          >
            {isSubmitting ? "Guardando..." : "Guardar Categoría"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Category } from "@prisma/client";
import { Trash2, Tags } from "lucide-react";
import { deleteCategory } from "@/app/actions/categories";
import { AddCategoryDialog } from "@/components/categories/AddCategoryDialog";

export function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted-foreground">No hay categorías. ¡Creá la primera!</p>
        <div className="mt-4">
          <AddCategoryDialog />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Tags className="w-4 h-4 text-muted-foreground" /> Mis Categorías
        </h3>
        <AddCategoryDialog />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
            <span className="text-sm font-medium">{c.name}</span>
            <button 
              onClick={async () => {
                if (confirm(`¿Eliminar la categoría "${c.name}"?`)) {
                  try {
                    await deleteCategory(c.id);
                  } catch (e: any) {
                    alert(e.message || "Error al eliminar");
                  }
                }
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Eliminar categoría"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

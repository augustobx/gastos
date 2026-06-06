"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tag } from "lucide-react";
import { Category } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category") || "all";

  const handleCategoryChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("category");
    } else {
      params.set("category", val);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentCategory} onValueChange={handleCategoryChange}>
      <SelectTrigger className="w-[180px] h-9 border rounded-xl bg-card hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <Tag className="w-4 h-4" />
          <SelectValue placeholder="Todas las categorías" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="font-medium">
          Todas las categorías
        </SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id} className="font-medium">
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

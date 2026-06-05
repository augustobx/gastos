"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";

export async function getCategories() {
  const session = await verifySession();
  if (!session) return [];

  return await prisma.category.findMany({
    where: { userId: session.userId },
    orderBy: { name: "asc" }
  });
}

export async function createCategory(data: { name: string, color?: string, icon?: string }) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  await prisma.category.create({
    data: { name: data.name, color: data.color, icon: data.icon, userId: session.userId }
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/fixed");
  revalidatePath("/settings");
}

export async function deleteCategory(id: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  // Check if it's used
  const txCount = await prisma.transaction.count({ where: { categoryId: id, userId: session.userId } });
  const fixedCount = await prisma.fixedTransaction.count({ where: { categoryId: id, userId: session.userId } });
  
  if (txCount > 0 || fixedCount > 0) {
    throw new Error("No se puede eliminar porque está en uso.");
  }

  await prisma.category.delete({
    where: { id, userId: session.userId }
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/fixed");
  revalidatePath("/settings");
}

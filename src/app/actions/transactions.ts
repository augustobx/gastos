"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/schemas";
import { z } from "zod";
import { verifySession } from "@/lib/session";

export async function getTransactions() {
  const session = await verifySession();
  if (!session) return [];

  return await prisma.transaction.findMany({
    where: { userId: session.userId },
    orderBy: { date: "desc" },
    include: { category: true, fixedTransaction: true }
  });
}

export async function createTransaction(data: z.infer<typeof transactionSchema>) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const parsed = transactionSchema.parse(data);
  
  await prisma.transaction.create({
    data: {
      amount: parsed.amount,
      type: parsed.type,
      date: parsed.date,
      description: parsed.description,
      notes: parsed.notes || null,
      categoryId: parsed.categoryId || null,
      userId: session.userId
    },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function deleteTransaction(id: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  await prisma.transaction.delete({
    where: { id, userId: session.userId },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function updateTransaction(id: string, data: z.infer<typeof transactionSchema>) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const parsed = transactionSchema.parse(data);
  
  await prisma.transaction.update({
    where: { id, userId: session.userId },
    data: {
      amount: parsed.amount,
      type: parsed.type,
      date: parsed.date,
      description: parsed.description,
      notes: parsed.notes || null,
      categoryId: parsed.categoryId || null
    },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function categorizeTransaction(id: string, categoryId: string | null, notes?: string | null) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  await prisma.transaction.update({
    where: { id, userId: session.userId },
    data: { 
      categoryId,
      ...(notes !== undefined ? { notes } : {})
    }
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/classifier");
}

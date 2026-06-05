"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fixedTransactionSchema } from "@/lib/schemas";
import { z } from "zod";
import { verifySession } from "@/lib/session";

export async function getFixedTransactions() {
  const session = await verifySession();
  if (!session) return [];

  return await prisma.fixedTransaction.findMany({
    where: { userId: session.userId },
    orderBy: { dayOfMonth: "asc" },
    include: { category: true, transactions: true }
  });
}

export async function createFixedTransaction(data: z.infer<typeof fixedTransactionSchema>) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const parsed = fixedTransactionSchema.parse(data);
  
  await prisma.fixedTransaction.create({
    data: {
      amount: parsed.amount,
      type: parsed.type,
      dayOfMonth: parsed.dayOfMonth,
      description: parsed.description,
      categoryId: parsed.categoryId || null,
      isActive: parsed.isActive,
      userId: session.userId
    },
  });

  revalidatePath("/fixed");
}

export async function deleteFixedTransaction(id: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  await prisma.fixedTransaction.delete({
    where: { id, userId: session.userId },
  });

  revalidatePath("/fixed");
  revalidatePath("/");
}

export async function updateFixedTransaction(id: string, data: z.infer<typeof fixedTransactionSchema>) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const parsed = fixedTransactionSchema.parse(data);
  
  await prisma.fixedTransaction.update({
    where: { id, userId: session.userId },
    data: {
      amount: parsed.amount,
      type: parsed.type,
      dayOfMonth: parsed.dayOfMonth,
      description: parsed.description,
      categoryId: parsed.categoryId || null,
      isActive: parsed.isActive
    },
  });

  revalidatePath("/fixed");
  revalidatePath("/");
}

export async function payFixedTransaction(id: string, date: Date) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const fixedTx = await prisma.fixedTransaction.findUnique({ where: { id, userId: session.userId } });
  if (!fixedTx) throw new Error("Not found");

  await prisma.transaction.create({
    data: {
      amount: fixedTx.amount,
      type: fixedTx.type,
      date: date,
      description: fixedTx.description || "Pago fijo",
      categoryId: fixedTx.categoryId,
      fixedTransactionId: fixedTx.id,
      userId: session.userId
    }
  });

  revalidatePath("/fixed");
  revalidatePath("/");
}

export async function unpayFixedTransaction(transactionId: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  await prisma.transaction.delete({
    where: { id: transactionId, userId: session.userId }
  });

  revalidatePath("/fixed");
  revalidatePath("/");
}

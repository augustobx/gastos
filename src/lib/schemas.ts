import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.coerce.date(),
  description: z.string().optional(),
  categoryId: z.string().optional().nullable(),
});

export const fixedTransactionSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  dayOfMonth: z.coerce.number().min(1).max(31),
  description: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  color: z.string().optional(),
  icon: z.string().optional()
});

"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";

const MP_API = "https://api.mercadopago.com";

async function getMpUserId(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${MP_API}/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return String(data.id);
  } catch {
    return null;
  }
}

export async function syncMercadoPago() {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return { error: "No se configuró el Access Token de MercadoPago" };

  // Obtener el ID del usuario de MP para saber si es ingreso o gasto
  const mpUserId = await getMpUserId(token);
  if (!mpUserId) return { error: "No se pudo conectar con MercadoPago. Verificá el Access Token." };

  // Buscar los últimos 100 pagos aprobados de los últimos 60 días
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const params = new URLSearchParams({
    sort: "date_created",
    criteria: "desc",
    limit: "100",
    "begin_date": since.toISOString(),
    "end_date": new Date().toISOString(),
  });

  const res = await fetch(`${MP_API}/v1/payments/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    return { error: `Error de MercadoPago (${res.status}): ${errText}` };
  }

  const data = await res.json();
  const payments = data.results || [];

  let created = 0;
  let skipped = 0;

  for (const payment of payments) {
    // Solo importar pagos aprobados
    if (payment.status !== "approved") continue;

    const externalId = `mp_${payment.id}`;

    // Verificar si ya existe para evitar duplicados
    const existing = await prisma.transaction.findUnique({
      where: { externalId },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Determinar si es ingreso o gasto
    // Si el collector (quien recibe la plata) soy yo → INGRESO
    // Si el payer (quien paga) soy yo → GASTO
    const collectorId = String(payment.collector?.id || "");
    const isIncome = collectorId === mpUserId;

    // Armar la descripción
    let desc = payment.description || "";
    if (!desc && payment.payment_method_id) {
      desc = `Pago vía ${payment.payment_method_id}`;
    }
    if (payment.payer?.email && isIncome) {
      desc = desc ? `${desc} (de: ${payment.payer.email})` : `Pago de ${payment.payer.email}`;
    }
    desc = desc || (isIncome ? "Ingreso MercadoPago" : "Gasto MercadoPago");

    await prisma.transaction.create({
      data: {
        amount: Math.abs(payment.transaction_amount),
        type: isIncome ? "INCOME" : "EXPENSE",
        date: new Date(payment.date_created),
        description: `🔵 ${desc}`,
        externalId,
        source: "mercadopago",
        userId: session.userId,
      },
    });

    created++;
  }

  revalidatePath("/");
  revalidatePath("/transactions");

  return { created, skipped, total: payments.length };
}

export async function checkMpConnection() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return { connected: false };

  const mpUserId = await getMpUserId(token);
  return { connected: !!mpUserId };
}

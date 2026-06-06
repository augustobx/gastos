"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";

const MP_API = "https://api.mercadopago.com";

async function getMpUserId(token: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.mercadolibre.com/users/me`, {
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

  const mpUserId = await getMpUserId(token);
  if (!mpUserId) return { error: "No se pudo conectar con MercadoPago. Verificá el Access Token." };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "Usuario no encontrado" };

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
    if (payment.status !== "approved") continue;

    // Filters based on User Settings
    if (user.mpIgnoreSavings) {
      if (payment.operation_type === "partition_transfer" || payment.operation_type === "investment") {
        skipped++;
        continue;
      }
    }

    if (user.mpIgnoreAccountFund) {
      if (payment.operation_type === "account_fund") {
        skipped++;
        continue;
      }
    }

    const externalId = `mp_${payment.id}`;

    const existing = await prisma.transaction.findUnique({
      where: { externalId },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const collectorId = String(payment.collector_id || payment.collector?.id || "");
    const isIncome = collectorId === mpUserId;

    // Better Description Extraction
    let desc = payment.description;
    
    if (!desc) {
      desc = payment.point_of_interaction?.transaction_data?.commerce?.name;
    }
    
    if (!desc && payment.reason) {
      desc = payment.reason;
    }

    if (!desc) {
      if (payment.payment_method_id) {
        desc = `Pago vía ${payment.payment_method_id}`;
      } else {
        desc = isIncome ? "Ingreso MercadoPago" : "Gasto MercadoPago";
      }
    }

    if (payment.payer?.email && isIncome && payment.payer.email !== user.email) {
      desc = desc ? `${desc} (de: ${payment.payer.email})` : `Pago de ${payment.payer.email}`;
    }

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
  revalidatePath("/classifier");

  return { created, skipped, total: payments.length };
}

export async function checkMpConnection() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return { connected: false };

  const mpUserId = await getMpUserId(token);
  return { connected: !!mpUserId };
}

export async function updateMpSettings(mpIgnoreSavings: boolean, mpIgnoreAccountFund: boolean) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      mpIgnoreSavings,
      mpIgnoreAccountFund,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

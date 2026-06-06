import { prisma } from "./src/lib/prisma";
const MP_API = "https://api.mercadopago.com";

async function run() {
  const token = "APP_USR-4485529648075877-060516-d301df07a9613da25f9c5011af5b6fb7-71183152";
  
  // get user id
  const userRes = await fetch(`https://api.mercadolibre.com/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userData = await userRes.json();
  const mpUserId = String(userData.id);
  console.log("MP User ID:", mpUserId);

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
  const data = await res.json();
  const payments = data.results || [];
  
  let created = 0;
  let skipped = 0;

  for (const payment of payments) {
    if (payment.status !== "approved") continue;

    const externalId = `mp_${payment.id}`;
    
    if (created + skipped < 5) {
      console.log(`\n--- Processing payment ${payment.id} ---`);
      console.log(`Amount: ${payment.transaction_amount}`);
      console.log(`Description: ${payment.description}`);
      console.log(`Operation Type: ${payment.operation_type}`);
      console.log(`Payment Type: ${payment.payment_type_id}`);
      console.log(`Reason: ${payment.reason || payment.payer?.entity_type}`);
      console.log(`Full JSON:`, JSON.stringify(payment, null, 2));
    }

    created++;
  }
  
  console.log(`\nTotals: ${created} created, ${skipped} skipped`);
}

run().catch(console.error);

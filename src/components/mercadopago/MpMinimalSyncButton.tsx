"use client";

import { useState } from "react";
import { syncMercadoPago } from "@/app/actions/mercadopago";
import { RefreshCw } from "lucide-react";

export function MpMinimalSyncButton() {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      await syncMercadoPago();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      title="Sincronizar MercadoPago"
      className="flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-sky-500 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-sky-500" : ""}`} />
    </button>
  );
}

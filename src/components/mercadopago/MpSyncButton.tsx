"use client";

import { useState } from "react";
import { syncMercadoPago } from "@/app/actions/mercadopago";
import { RefreshCw, Check, AlertCircle } from "lucide-react";

export function MpSyncButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created?: number; skipped?: number; error?: string } | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);
    try {
      const res = await syncMercadoPago();
      setResult(res);
    } catch (e: any) {
      setResult({ error: e.message || "Error desconocido" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Sincronizando..." : "Sincronizar ahora"}
      </button>

      {result && !result.error && (
        <div className="flex items-center gap-2 text-emerald-500 text-xs font-medium bg-emerald-500/10 rounded-lg p-3">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            {result.created === 0
              ? "Todo al día, no hay movimientos nuevos."
              : `Se importaron ${result.created} movimientos nuevos. ${result.skipped} ya existían.`}
          </span>
        </div>
      )}

      {result?.error && (
        <div className="flex items-center gap-2 text-rose-500 text-xs font-medium bg-rose-500/10 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}
    </div>
  );
}

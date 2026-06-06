"use client";

import { useState } from "react";
import { updateMpSettings } from "@/app/actions/mercadopago";
import { Loader2 } from "lucide-react";

interface MpSettingsFormProps {
  initialIgnoreSavings: boolean;
  initialIgnoreAccountFund: boolean;
}

export function MpSettingsForm({ initialIgnoreSavings, initialIgnoreAccountFund }: MpSettingsFormProps) {
  const [ignoreSavings, setIgnoreSavings] = useState(initialIgnoreSavings);
  const [ignoreAccountFund, setIgnoreAccountFund] = useState(initialIgnoreAccountFund);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (type: "savings" | "accountFund", value: boolean) => {
    setIsUpdating(true);
    try {
      const newSavings = type === "savings" ? value : ignoreSavings;
      const newFund = type === "accountFund" ? value : ignoreAccountFund;
      
      if (type === "savings") setIgnoreSavings(newSavings);
      if (type === "accountFund") setIgnoreAccountFund(newFund);

      await updateMpSettings(newSavings, newFund);
    } catch (e) {
      console.error(e);
      // Revert on error
      if (type === "savings") setIgnoreSavings(!value);
      if (type === "accountFund") setIgnoreAccountFund(!value);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
      
      {/* Ignore Savings Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
        <div className="pr-4">
          <h4 className="text-sm font-semibold text-foreground">Ignorar Ahorros / Rendimientos</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Evita que se importen movimientos internos de Mercado Fondo o "Ahorros" (rendimientos diarios, suscripciones y rescates de fondos).
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={ignoreSavings}
          onClick={() => handleToggle("savings", !ignoreSavings)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
            ignoreSavings ? "bg-primary" : "bg-muted-foreground/30"
          }`}
        >
          <span
            className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
              ignoreSavings ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Ignore Account Fund Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
        <div className="pr-4">
          <h4 className="text-sm font-semibold text-foreground">Ignorar Ingresos de Dinero Propios</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Evita importar movimientos cuando transferís dinero desde tus propias cuentas bancarias a tu cuenta de Mercado Pago.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={ignoreAccountFund}
          onClick={() => handleToggle("accountFund", !ignoreAccountFund)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
            ignoreAccountFund ? "bg-primary" : "bg-muted-foreground/30"
          }`}
        >
          <span
            className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
              ignoreAccountFund ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

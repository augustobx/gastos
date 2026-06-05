"use client";

import { useActionState } from "react";
import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerUser, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Sumate a la familia</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Ej. Juan" 
              required 
              className="h-11 rounded-xl bg-muted/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input 
              id="username" 
              name="username" 
              placeholder="Ej. juancito" 
              required 
              className="h-11 rounded-xl bg-muted/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="h-11 rounded-xl bg-muted/30"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-rose-500 font-medium text-center">{state.error}</p>
          )}

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-11 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 mt-2"
          >
            {isPending ? "Creando..." : "Registrarse"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          ¿Ya tenés una cuenta?{" "}
          <Link href="/login" className="font-semibold text-emerald-500 hover:underline">
            Iniciá sesión acá
          </Link>
        </div>
      </div>
    </div>
  );
}

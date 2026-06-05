import { Wallet, Smartphone, Info, User as UserIcon, LogOut } from "lucide-react";
import { getCategories } from "@/app/actions/categories";
import { CategoryList } from "@/components/categories/CategoryList";
import { verifySession } from "@/lib/session";
import { logoutUser } from "@/app/actions/auth";

export default async function SettingsPage() {
  const session = await verifySession();
  const categories = await getCategories();

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-6 max-w-[800px] mx-auto w-full">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ajustes</h2>
        <p className="text-sm text-muted-foreground mt-1">Configuración de la aplicación</p>
      </div>

      {session && (
        <div className="bg-card rounded-2xl border overflow-hidden p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{session.name || session.username}</p>
              <p className="text-xs text-muted-foreground">@{session.username}</p>
            </div>
          </div>
          <form action={logoutUser}>
            <button 
              type="submit"
              className="text-sm font-semibold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </form>
        </div>
      )}

      <div className="bg-card rounded-2xl border overflow-hidden p-5">
        <CategoryList categories={categories} />
      </div>

      {/* About Card */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/15">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">Gastos PWA</p>
              <p className="text-xs text-muted-foreground">v1.0.0 · Control Financiero Personal</p>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-border/50">
          <div className="flex items-start gap-3 p-5">
            <div className="p-2 rounded-lg bg-sky-500/10 shrink-0 mt-0.5">
              <Smartphone className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Instalar en tu dispositivo</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Podés instalar esta app en tu celular o computadora. 
                En Chrome, tocá el menú (⋮) y elegí <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5">
            <div className="p-2 rounded-lg bg-amber-500/10 shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Acerca de</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Aplicación web progresiva para el control de finanzas personales. 
                Registra ingresos, gastos y movimientos fijos de forma manual. 
                Todos los datos se almacenan de forma local en tu servidor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

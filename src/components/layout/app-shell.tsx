"use client";

import { Home, Wallet, Repeat, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Movimientos", href: "/transactions", icon: Wallet },
  { name: "Fijos", href: "/fixed", icon: Repeat },
  { name: "Ajustes", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-border/50 bg-card/60 backdrop-blur-xl">
        {/* Logo */}
        <div className="p-7 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-foreground">Gastos</h1>
              <p className="text-[11px] text-muted-foreground -mt-0.5">Control Financiero</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 mt-6 space-y-1">
          <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Menú
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActive ? "bg-primary/15" : "group-hover:bg-muted"
                )}>
                  <item.icon className="w-4 h-4" />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-foreground">Gastos PWA</p>
            <p className="text-[11px] text-muted-foreground mt-1">Tu asistente financiero personal</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-[88px] md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/90 backdrop-blur-2xl flex items-center justify-around px-1 z-50"
           style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)", height: "calc(72px + env(safe-area-inset-bottom, 8px))" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 relative",
                isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-[3px] rounded-full bg-primary" />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-105")} />
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

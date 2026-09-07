"use client";

import { CalendarDays, Receipt, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pageTitles: Record<string, string> = {
  "/": "Tableau de bord",
  "/clients": "Clients",
  "/invoices": "Factures",
};

export function Header() {
  const pathname = usePathname();
  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      path === "/" ? pathname === path : pathname.startsWith(path),
    )?.[1] ?? "Mabdelha";

  const today = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex min-h-14 items-center justify-between border-b border-border/80 bg-card/95 px-3 backdrop-blur-sm sm:min-h-20 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:block">
        <div className="flex items-center gap-2 sm:block">
          <Receipt
            className="size-5 text-[#c94c4c] sm:hidden"
            aria-hidden="true"
          />
          <span className="text-lg font-semibold text-primary sm:hidden">
            Mabdelha
          </span>
          <p className="mb-1 hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c94c4c] sm:block">
            Mon cahier
          </p>

          <h1 className="truncate text-lg text-primary sm:text-2xl">
            {pageTitle}
          </h1>

          <p className="hidden text-sm text-muted-foreground sm:block">
            Vue générale de votre activité
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground sm:gap-2 sm:text-sm">
        <CalendarDays className="hidden size-4 sm:block" />

        <span className="hidden sm:inline">{today}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-11 items-center justify-center rounded-md text-primary hover:bg-muted"
              aria-label="Ouvrir le menu utilisateur"
            >
              <UserRound className="size-5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Home, Menu, Plus, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navigation = [
  { name: "Accueil", href: "/", icon: Home },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Factures", href: "/invoices", icon: FileText },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 h-[var(--mobile-nav-height)] border-t border-border bg-card px-2 pt-1 pb-[var(--mobile-safe-bottom)] md:hidden"
      >
        <div className="mx-auto grid h-full max-w-lg grid-cols-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            type="button"
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors",
              moreOpen
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-label="Plus d'actions"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen(true)}
          >
            <Menu className="size-5" strokeWidth={moreOpen ? 2.25 : 1.75} />
            <span>Plus</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-[max(1rem,var(--mobile-safe-bottom))]">
          <SheetHeader>
            <SheetTitle>Actions rapides</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4 pb-4">
            <Link
              href="/invoices/new"
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-muted"
              onClick={() => setMoreOpen(false)}
            >
              <Plus className="size-4" />
              Nouvelle facture
            </Link>
            <Link
              href="/clients/new"
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-muted"
              onClick={() => setMoreOpen(false)}
            >
              <Plus className="size-4" />
              Nouveau client
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

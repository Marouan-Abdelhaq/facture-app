"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";

import { LogoutButton } from "@/components/auth/logout-button";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Factures",
    href: "/invoices",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex md:h-full">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-5 md:px-6">
        <div className="flex size-10 items-center justify-center rounded-sm border border-[#c94c4c]/40 bg-[#1e3a5f] text-[#fffcf5] shadow-[2px_2px_0_rgba(30,58,95,0.12)]">
          <Receipt className="size-5" />
        </div>

        <div>
          <h1 className="text-xl tracking-wide text-sidebar-foreground">
            FACTURI
          </h1>

          <p className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
            Cahier de facturation
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 gap-1 overflow-x-auto p-3 md:flex-col md:space-y-1">
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
                "flex shrink-0 items-center gap-3 rounded-sm border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-[#c94c4c] bg-sidebar-accent text-sidebar-accent-foreground"
                  : "border-transparent text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-5" />

              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}

      <div className="flex gap-1 border-t border-sidebar-border p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}

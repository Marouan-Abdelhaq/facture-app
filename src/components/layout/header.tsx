"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, UserRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getBackHref, getPageTitle } from "@/lib/page-title";

export function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const backHref = getBackHref(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 md:h-16 md:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-muted md:size-10"
            aria-label="Retour"
          >
            <ArrowLeft className="size-5" />
          </Link>
        ) : null}

        <h1 className="truncate text-base font-semibold md:text-xl">{pageTitle}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-muted md:size-10"
            aria-label="Ouvrir le menu utilisateur"
          >
            <UserRound className="size-5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52 p-1">
          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

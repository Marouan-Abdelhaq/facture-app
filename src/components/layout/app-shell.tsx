"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <Sidebar />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <Header />

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-[var(--page-bottom-spacing)] pt-5 md:px-6 md:pt-6 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

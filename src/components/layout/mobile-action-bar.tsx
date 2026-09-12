"use client";

import { useLayoutEffect, type ReactNode } from "react";

interface MobileActionBarProps {
  children: ReactNode;
}

export function MobileActionBar({ children }: MobileActionBarProps) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--mobile-action-bar-height", "5.5rem");

    return () => {
      root.style.setProperty("--mobile-action-bar-height", "0px");
    };
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-[var(--mobile-nav-height)] z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md md:hidden">
      {children}
    </div>
  );
}

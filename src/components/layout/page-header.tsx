import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  if (!title && !description && !action) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
      {(title || description) && (
        <div className="min-w-0">
          {title ? (
            <h1 className="text-2xl font-semibold tracking-tight md:text-[32px] md:leading-10">
              {title}
            </h1>
          ) : null}
          {description ? (
            <p className={cn("text-sm text-muted-foreground md:text-base", title && "mt-1")}>
              {description}
            </p>
          ) : null}
        </div>
      )}

      {action ? (
        <div className="flex w-full shrink-0 sm:w-auto sm:justify-end">{action}</div>
      ) : null}
    </div>
  );
}

import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-start justify-between p-4 sm:p-6">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </p>

          <p className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {value}
          </p>

          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="border-l border-[#c94c4c]/50 pl-3">{icon}</div>
      </CardContent>
    </Card>
  );
}

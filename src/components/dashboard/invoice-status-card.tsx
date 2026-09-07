import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface InvoiceStatusCardProps {
  title: string;
  value: number;
  description: string;
  icon: ReactNode;
}

export function InvoiceStatusCard({
  title,
  value,
  description,
  icon,
}: InvoiceStatusCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5 sm:p-6">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </p>

          <p className="text-2xl font-semibold tracking-tight text-primary">
            {value}
          </p>

          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="border-l border-[#c94c4c]/50 pl-3">{icon}</div>
      </CardContent>
    </Card>
  );
}

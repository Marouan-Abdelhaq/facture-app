import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { formatCurrency } from "@/lib/format";

interface ClientCardProps {
  id: string;
  name: string;
  phone: string | null;
  totalInvoices: number;
  totalSales: number | string;
  totalCredit?: number | string;
}

export function ClientCard({
  id,
  name,
  phone,
  totalInvoices,
  totalSales,
  totalCredit,
}: ClientCardProps) {
  const credit = Number(totalCredit ?? 0);

  return (
    <Link
      href={`/clients/${id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {phone ?? "Pas de téléphone"}
          </p>
        </div>
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          {totalInvoices} facture{totalInvoices > 1 ? "s" : ""}
        </p>
        <p className="font-semibold">{formatCurrency(totalSales)}</p>
      </div>

      {credit > 0 ? (
        <p className="mt-2 text-xs font-medium text-warning">
          Crédit {formatCurrency(credit)}
        </p>
      ) : null}
    </Link>
  );
}

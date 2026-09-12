import Link from "next/link";

import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";

interface InvoiceCardProps {
  id: string;
  invoiceNumber: string;
  clientName: string;
  invoiceDate: string;
  totalAmount: number | string;
  status: string;
}

export function InvoiceCard({
  id,
  invoiceNumber,
  clientName,
  invoiceDate,
  totalAmount,
  status,
}: InvoiceCardProps) {
  return (
    <Link
      href={`/invoices/${id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-foreground">{invoiceNumber}</p>
        <StatusBadge status={status} />
      </div>

      <dl className="mt-3 space-y-1.5 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Client</dt>
          <dd>{clientName}</dd>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <dt className="text-xs text-muted-foreground">Date</dt>
            <dd className="text-muted-foreground">{formatDate(invoiceDate)}</dd>
          </div>
          <dd className="text-base font-semibold">{formatCurrency(totalAmount)}</dd>
        </div>
      </dl>
    </Link>
  );
}

import Link from "next/link";
import { FileText } from "lucide-react";

import { InvoiceCard } from "@/components/invoices/invoice-card";
import { EmptyState } from "@/components/layout/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/format";

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: string;
  remaining_amount: string;
  invoice_date: string;
  clients: {
    id: string;
    name: string;
  } | null;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Factures récentes</h2>
        <Link
          href="/invoices"
          className="text-sm font-medium text-primary hover:underline"
        >
          Voir toutes
        </Link>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-8" />}
          title="Aucune facture"
          description="Vos factures apparaîtront ici."
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                id={invoice.id}
                invoiceNumber={invoice.invoice_number}
                clientName={invoice.clients?.name ?? "Client inconnu"}
                invoiceDate={invoice.invoice_date}
                totalAmount={invoice.total_amount}
                status={invoice.status}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {invoice.clients?.name ?? "Client inconnu"}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                  <StatusBadge status={invoice.status} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

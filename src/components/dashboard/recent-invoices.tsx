import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

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

function formatCurrency(amount: string) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    unpaid: "Non payée",
    partial: "Partielle",
    paid: "Payée",
    overpaid: "À rembourser",
    cancelled: "Annulée",
  };

  return labels[status] ?? status;
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/80 pb-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c94c4c]">
            Registre des factures
          </p>
          <CardTitle className="text-xl text-primary">
            Factures récentes
          </CardTitle>
        </div>

        <Link
          href="/invoices"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Voir toutes
          <ArrowRight className="size-4" />
        </Link>
      </CardHeader>

      <CardContent>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="mb-3 size-10 text-muted-foreground" />

            <p className="font-medium">Aucune facture</p>

            <p className="text-sm text-muted-foreground">
              Vos factures apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/80">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="flex items-center justify-between gap-4 px-2 py-4 transition-colors hover:bg-muted/50 sm:px-3"
              >
                <div>
                  <p className="font-semibold text-primary">
                    {invoice.invoice_number}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {invoice.clients?.name ?? "Client inconnu"}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                  <p className="font-medium">
                    {formatCurrency(invoice.total_amount)}
                  </p>

                  <Badge variant="secondary">
                    {getStatusLabel(invoice.status)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

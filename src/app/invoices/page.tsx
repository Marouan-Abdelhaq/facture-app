import Link from "next/link";
import { redirect } from "next/navigation";

import { Plus, FileText } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { normalizeRelation } from "@/lib/supabase/relations";

import { Button } from "@/components/ui/button";

import { InvoicesList } from "@/components/invoices/invoices-list";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      status,
      invoice_date,
      total_amount,
      paid_amount,
      remaining_amount,
      refund_amount,
      clients (
        name
      )
    `,
    )
    .eq("user_id", user.id)
    .order("invoice_date", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement des factures
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  const normalizedInvoices = (invoices ?? []).map((invoice) => ({
    ...invoice,
    clients: normalizeRelation(invoice.clients),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Factures</h2>

          <p className="text-muted-foreground">
            Gérez vos factures et vos paiements.
          </p>
        </div>

        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 size-4" />
            Nouvelle facture
          </Link>
        </Button>
      </div>

      {/* Liste */}

      <div className="rounded-xl border bg-card">
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-muted-foreground" />

            <div>
              <h3 className="font-semibold">Liste des factures</h3>

              <p className="text-sm text-muted-foreground">
                {normalizedInvoices.length} facture(s) au total
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <InvoicesList invoices={normalizedInvoices} />
        </div>
      </div>
    </div>
  );
}

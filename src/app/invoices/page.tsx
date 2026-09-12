import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { normalizeRelation } from "@/lib/supabase/relations";

import { Button } from "@/components/ui/button";
import { InvoicesList } from "@/components/invoices/invoices-list";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

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
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
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
    <PageContainer>
      <PageHeader
        description="Gérez vos factures et vos paiements."
        action={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/invoices/new">
              <Plus className="size-4" />
              Nouvelle facture
            </Link>
          </Button>
        }
      />

      <InvoicesList invoices={normalizedInvoices} />
    </PageContainer>
  );
}

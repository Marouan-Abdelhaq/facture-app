import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { EditInvoiceForm } from "@/components/invoices/edit-invoice-form";

interface EditInvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditInvoicePage({
  params,
}: EditInvoicePageProps) {
  const { id } = await params;

  const supabase = await createClient();

  /*
   * 1. Récupérer la facture
   */

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select(
      `
      id,
      client_id,
      invoice_number,
      invoice_date,
      notes,
      total_amount,
      paid_amount,
      remaining_amount,
      refund_amount,
      status
    `,
    )
    .eq("id", id)
    .single();

  if (invoiceError || !invoice) {
    notFound();
  }

  /*
   * 2. Récupérer tous les clients
   */

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select(
      `
      id,
      name,
      phone
    `,
    )
    .order("name");

  if (clientsError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement des clients
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {clientsError.message}
        </p>
      </div>
    );
  }

  /*
   * 3. Récupérer les produits/services
   */

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select(
      `
      id,
      product_name,
      quantity,
      unit_price,
      total_amount
    `,
    )
    .eq("invoice_id", id)
    .order("created_at", {
      ascending: true,
    });

  if (itemsError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement des produits
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {itemsError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Modifier la facture
        </h2>

        <p className="text-muted-foreground">
          Modifiez les informations de la facture {invoice.invoice_number}.
        </p>
      </div>

      <EditInvoiceForm
        invoice={invoice}
        clients={clients ?? []}
        items={items ?? []}
      />
    </div>
  );
}

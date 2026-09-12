import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function NewInvoicePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border p-6">
        <h2 className="font-semibold">Utilisateur non authentifié</h2>
      </div>
    );
  }

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name, phone")
    .eq("user_id", user.id)
    .order("name");

  if (clientsError) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {clientsError.message}
        </p>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader description="Créez une nouvelle facture pour un client." />
      <InvoiceForm clients={clients ?? []} />
    </PageContainer>
  );
}

import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export default async function NewInvoicePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-lg border p-6">
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
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Nouvelle facture</h2>

        <p className="text-muted-foreground">
          Créez une nouvelle facture pour un client.
        </p>
      </div>

      <InvoiceForm clients={clients ?? []} />
    </div>
  );
}

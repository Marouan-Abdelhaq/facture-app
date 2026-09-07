import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { InvoiceStatusCard } from "@/components/dashboard/invoice-status-card";

import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  TriangleAlert,
  Users,
} from "lucide-react";

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export default async function Home() {
  const supabase = await createClient();

  /*
   * Utilisateur connecté
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * 1. Dashboard personnel
   */

  const { data, error } = await supabase
    .from("dashboard_summary")
    .select("*")
    .single();

  /*
   * 2. Statuts des factures
   */

  const { data: invoiceStatus, error: invoiceStatusError } = await supabase
    .from("invoice_status_summary")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (invoiceStatusError) {
    console.error("Erreur lors du chargement des statuts:", invoiceStatusError);
  }

  /*
   * 3. Factures récentes
   */

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select(
      `
        id,
        invoice_number,
        status,
        total_amount,
        remaining_amount,
        invoice_date,
        clients (
          id,
          name
        )
      `,
    )
    .eq("user_id", user.id)
    .order("invoice_date", { ascending: false })
    .limit(5);

  if (invoicesError) {
    console.error("Erreur lors du chargement des factures:", invoicesError);
  }

  const normalizedInvoices = (invoices ?? []).map((invoice) => ({
    ...invoice,
    client: invoice.clients[0] ?? null,
  }));

  /*
   * Erreur Dashboard
   */

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement du Dashboard
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  /*
   * Pas encore de données
   */

  if (!data) {
    return (
      <div className="rounded-lg border bg-background p-6">
        <h2 className="font-semibold">Aucune donnée disponible</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Ajoutez votre premier client ou votre première facture pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bonjour 👋</h2>

        <p className="text-muted-foreground">
          Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Statistiques principales */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total ventes"
          value={formatCurrency(data.total_sales)}
          description={`${data.total_invoices} facture(s)`}
          icon={<CircleDollarSign className="size-5 text-muted-foreground" />}
        />

        <StatsCard
          title="Montant encaissé"
          value={formatCurrency(data.total_received)}
          description="Montant reçu des clients"
          icon={<CreditCard className="size-5 text-muted-foreground" />}
        />

        <StatsCard
          title="Crédit clients"
          value={formatCurrency(data.total_credit)}
          description="Montant restant à récupérer"
          icon={<TriangleAlert className="size-5 text-muted-foreground" />}
        />

        <StatsCard
          title="Clients"
          value={data.total_clients}
          description="Clients enregistrés"
          icon={<Users className="size-5 text-muted-foreground" />}
        />
      </div>

      {/* État des factures */}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">État des factures</h3>

          <p className="text-sm text-muted-foreground">
            Répartition de vos factures selon leur paiement.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <InvoiceStatusCard
            title="Payées"
            value={invoiceStatus?.paid_invoices ?? 0}
            description="Factures entièrement réglées"
            icon={<CheckCircle2 className="size-5 text-muted-foreground" />}
          />

          <InvoiceStatusCard
            title="Partielles"
            value={invoiceStatus?.partial_invoices ?? 0}
            description="Factures partiellement réglées"
            icon={<Clock3 className="size-5 text-muted-foreground" />}
          />

          <InvoiceStatusCard
            title="Non payées"
            value={invoiceStatus?.unpaid_invoices ?? 0}
            description="Factures sans paiement"
            icon={<TriangleAlert className="size-5 text-muted-foreground" />}
          />
        </div>
      </div>

      {/* Factures récentes */}

      <RecentInvoices invoices={normalizedInvoices} />
    </div>
  );
}

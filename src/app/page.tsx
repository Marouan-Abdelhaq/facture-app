import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { normalizeRelation } from "@/lib/supabase/relations";
import { formatCurrency } from "@/lib/format";

import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { PageContainer } from "@/components/layout/page-container";

import { CircleDollarSign, CreditCard, TriangleAlert, Users } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("dashboard_summary")
    .select("*")
    .single();

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
    clients: normalizeRelation(invoice.clients),
  }));

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement du Dashboard
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <div>
          <h2 className="text-2xl font-semibold md:text-[32px]">Bonjour</h2>
          <p className="mt-1 text-muted-foreground">
            Vue rapide de votre activité
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Aucune donnée disponible</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajoutez votre premier client ou votre première facture pour commencer.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div>
        <h2 className="text-2xl font-semibold md:text-[32px]">Bonjour</h2>
        <p className="mt-1 text-muted-foreground">Vue rapide de votre activité</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total facturé"
          value={formatCurrency(data.total_sales)}
          description={`${data.total_invoices} facture(s)`}
          icon={<CircleDollarSign className="size-5" />}
        />
        <StatsCard
          title="Montant payé"
          value={formatCurrency(data.total_received)}
          description="Encaissé"
          icon={<CreditCard className="size-5" />}
        />
        <StatsCard
          title="Montant restant"
          value={formatCurrency(data.total_credit)}
          description="À récupérer"
          icon={<TriangleAlert className="size-5" />}
        />
        <StatsCard
          title="Clients"
          value={data.total_clients}
          description="Enregistrés"
          icon={<Users className="size-5" />}
        />
      </div>

      <RecentInvoices invoices={normalizedInvoices} />
    </PageContainer>
  );
}

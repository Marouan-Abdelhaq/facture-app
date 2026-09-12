import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ClientsList } from "@/components/clients/clients-list";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default async function ClientsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: clients, error } = await supabase
    .from("client_financial_summary")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement des clients
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        description="Gérez vos clients et leurs crédits."
        action={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/clients/new">
              <Plus className="size-4" />
              Nouveau client
            </Link>
          </Button>
        }
      />

      <ClientsList clients={clients ?? []} />
    </PageContainer>
  );
}

import Link from "next/link";

import { redirect } from "next/navigation";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase/server";

import { ClientsList } from "@/components/clients/clients-list";

export default async function ClientsPage() {
  const supabase = await createClient();

  /*
   * Récupérer l'utilisateur connecté
   */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /*
   * Charger uniquement les clients
   * de l'utilisateur connecté
   */

  const { data: clients, error } = await supabase
    .from("client_financial_summary")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement des clients
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>

          <p className="text-muted-foreground">
            Gérez vos clients et leurs crédits.
          </p>
        </div>

        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 size-4" />
            Nouveau client
          </Link>
        </Button>
      </div>

      <ClientsList clients={clients ?? []} />
    </div>
  );
}

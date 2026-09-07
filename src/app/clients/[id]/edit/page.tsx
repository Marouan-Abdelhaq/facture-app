import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { EditClientForm } from "@/components/clients/edit-client-form";

interface EditClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select(
      `
      id,
      name,
      phone,
      address
    `,
    )
    .eq("id", id)
    .single();

  if (error || !client) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Modifier le client
        </h2>

        <p className="text-muted-foreground">
          Modifiez les informations de {client.name}.
        </p>
      </div>

      <EditClientForm client={client} />
    </div>
  );
}

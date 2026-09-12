import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { EditClientForm } from "@/components/clients/edit-client-form";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

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
    <PageContainer className="max-w-2xl">
      <PageHeader description={`Modifiez les informations de ${client.name}.`} />
      <EditClientForm client={client} />
    </PageContainer>
  );
}

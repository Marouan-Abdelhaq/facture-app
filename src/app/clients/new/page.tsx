import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default function NewClientPage() {
  return (
    <PageContainer className="max-w-2xl">
      <PageHeader description="Ajoutez un nouveau client." />
      <div className="rounded-xl border border-border bg-card p-4 md:p-6">
        <ClientForm />
      </div>
    </PageContainer>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">
            <ArrowLeft className="mr-2 size-4" />
            Retour aux clients
          </Link>
        </Button>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Nouveau client</h2>

          <p className="text-muted-foreground">Ajoutez un nouveau client.</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="rounded-xl border bg-card p-6">
        <ClientForm />
      </div>
    </div>
  );
}

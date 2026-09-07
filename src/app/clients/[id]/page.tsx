import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Phone,
  MapPin,
  CircleDollarSign,
  CreditCard,
  TriangleAlert,
  Pencil,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    unpaid: "Non payée",
    partial: "Partielle",
    paid: "Payée",
    overpaid: "À rembourser",
    cancelled: "Annulée",
  };

  return labels[status] ?? status;
}

interface ClientPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  /*
   * 1. Informations du client
   */

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select(
      `
      id,
      name,
      phone,
      address,
      created_at
    `,
    )
    .eq("id", id)
    .single();

  if (clientError || !client) {
    notFound();
  }

  /*
   * 2. Résumé financier
   */

  const { data: financial } = await supabase
    .from("client_financial_summary")
    .select("*")
    .eq("client_id", id)
    .single();

  /*
   * 3. Factures du client
   */

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      status,
      invoice_date,
      total_amount,
      paid_amount,
      remaining_amount
    `,
    )
    .eq("client_id", id)
    .order("invoice_date", {
      ascending: false,
    });

  if (invoicesError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {invoicesError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">{client.name}</h2>

            <p className="text-muted-foreground">
              Informations et historique du client
            </p>
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link href={`/clients/${client.id}/edit`}>
            <Pencil className="mr-2 size-4" />
            Modifier
          </Link>
        </Button>
      </div>

      {/* Informations */}

      <Card>
        <CardHeader>
          <CardTitle>Informations du client</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="size-4 text-muted-foreground" />

            <span>{client.phone ?? "Pas de téléphone"}</span>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="size-4 text-muted-foreground" />

            <span>{client.address ?? "Pas d'adresse"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total ventes</p>

                <p className="mt-2 text-2xl font-bold">
                  {formatCurrency(financial?.total_sales ?? 0)}
                </p>
              </div>

              <CircleDollarSign className="size-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net payé</p>

                <p className="mt-2 text-2xl font-bold">
                  {formatCurrency(financial?.net_paid ?? 0)}
                </p>
              </div>

              <CreditCard className="size-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crédit restant</p>

                <p className="mt-2 text-2xl font-bold">
                  {formatCurrency(financial?.total_credit ?? 0)}
                </p>
              </div>

              <TriangleAlert className="size-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Nombre de factures
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {financial?.total_invoices ?? 0}
                </p>
              </div>

              <FileText className="size-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Factures */}

      <Card>
        <CardHeader>
          <CardTitle>Factures du client</CardTitle>
        </CardHeader>

        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>

                    <p className="text-sm text-muted-foreground">
                      {formatDate(invoice.invoice_date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>

                      <p className="font-semibold">
                        {formatCurrency(invoice.total_amount)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Reste</p>

                      <p className="font-semibold">
                        {formatCurrency(invoice.remaining_amount)}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="mb-3 size-10 text-muted-foreground" />

              <p className="font-medium">Aucune facture</p>

              <p className="text-sm text-muted-foreground">
                Ce client n&apos;a encore aucune facture.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

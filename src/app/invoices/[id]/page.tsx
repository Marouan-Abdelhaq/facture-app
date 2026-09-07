import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentForm } from "@/components/invoices/payment-form";
import { DeletePaymentButton } from "@/components/payments/delete-payment-button";
import { DownloadInvoicePdf } from "@/components/invoices/download-invoice-pdf";
import { RefundConfirmation } from "@/components/invoices/refund-confirmation";

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

interface InvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: invoiceData, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      status,
      invoice_date,
      notes,
      total_amount,
      paid_amount,
      remaining_amount,
      refund_amount,
      clients (
        id,
        name,
        phone,
        address
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !invoiceData) {
    notFound();
  }

  const invoice = {
    ...invoiceData,
    clients: invoiceData.clients[0] ?? null,
  };

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select(
      `
      id,
      product_name,
      quantity,
      unit_price,
      total_amount
    `,
    )
    .eq("invoice_id", id)
    .order("created_at", {
      ascending: true,
    });

  if (itemsError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {itemsError.message}
        </p>
      </div>
    );
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(
      `
    id,
    amount,
    payment_date,
    notes,
    created_at
  `,
    )
    .eq("invoice_id", id)
    .order("payment_date", {
      ascending: false,
    });

  if (paymentsError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement des paiements
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {paymentsError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">
                Facture {invoice.invoice_number}
              </h2>

              <Badge variant="secondary">
                {getStatusLabel(invoice.status)}
              </Badge>
            </div>

            <p className="text-muted-foreground">
              Créée le {formatDate(invoice.invoice_date)}
            </p>
          </div>
        </div>

        {/* Modifier */}

        <div className="flex items-center gap-3">
          <DownloadInvoicePdf invoice={invoice} items={items ?? []} />

          <Button variant="outline" asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Pencil className="mr-2 size-4" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      {/* Informations */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client */}

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <p className="font-semibold">
              {invoice.clients?.name ?? "Client inconnu"}
            </p>

            <p className="text-sm text-muted-foreground">
              {invoice.clients?.phone ?? "Pas de téléphone"}
            </p>

            <p className="text-sm text-muted-foreground">
              {invoice.clients?.address ?? "Pas d'adresse"}
            </p>
          </CardContent>
        </Card>

        {/* Résumé */}

        <Card>
          <CardHeader>
            <CardTitle>Résumé financier</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>

              <span className="font-semibold">
                {formatCurrency(invoice.total_amount)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant payé</span>

              <span className="font-semibold">
                {formatCurrency(invoice.paid_amount)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Reste à payer</span>

              <span className="font-semibold">
                {formatCurrency(invoice.remaining_amount)}
              </span>
            </div>

            {Number(invoice.refund_amount) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">À rembourser</span>

                <span className="font-semibold">
                  {formatCurrency(invoice.refund_amount)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Paiement ou remboursement */}

      {invoice.status === "overpaid" ? (
        <RefundConfirmation
          invoiceId={invoice.id}
          refundAmount={Number(invoice.refund_amount)}
        />
      ) : invoice.status !== "paid" ? (
        <PaymentForm
          invoiceId={invoice.id}
          remainingAmount={Number(invoice.remaining_amount)}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>

        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-4">
              <div className="hidden grid-cols-[1fr_160px_1fr_80px] gap-4 border-b pb-3 text-sm font-medium text-muted-foreground md:grid">
                <div>Date</div>
                <div>Montant</div>
                <div>Notes</div>
                <div>Actions</div>
              </div>

              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid gap-3 border-b pb-4 md:grid-cols-[1fr_160px_1fr_80px] md:gap-4"
                >
                  <div>
                    <span className="text-sm text-muted-foreground md:hidden">
                      Date :{" "}
                    </span>

                    {formatDate(payment.payment_date)}
                  </div>

                  <div className="font-semibold">
                    <span className="text-sm text-muted-foreground md:hidden">
                      Montant :{" "}
                    </span>

                    {formatCurrency(payment.amount)}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <span className="md:hidden">Notes : </span>

                    {payment.notes ?? "Aucune note"}
                  </div>

                  <div className="flex items-center">
                    <DeletePaymentButton paymentId={payment.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="font-medium">Aucun paiement enregistré</p>

              <p className="text-sm text-muted-foreground">
                Les paiements effectués apparaîtront ici.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Produits */}

      <Card>
        <CardHeader>
          <CardTitle>Produits et services</CardTitle>
        </CardHeader>

        <CardContent>
          {items && items.length > 0 ? (
            <div className="space-y-4">
              <div className="hidden grid-cols-[1fr_120px_160px_160px] gap-4 border-b pb-3 text-sm font-medium text-muted-foreground md:grid">
                <div>Produit</div>

                <div>Quantité</div>

                <div>Prix unitaire</div>

                <div className="text-right">Total</div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 border-b pb-4 md:grid-cols-[1fr_120px_160px_160px] md:gap-4 md:border-0 md:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground md:hidden">
                      Quantité :{" "}
                    </span>

                    {item.quantity}
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground md:hidden">
                      Prix :{" "}
                    </span>

                    {formatCurrency(item.unit_price)}
                  </div>

                  <div className="font-semibold md:text-right">
                    <span className="text-muted-foreground md:hidden">
                      Total :{" "}
                    </span>

                    {formatCurrency(item.total_amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="mb-3 size-10 text-muted-foreground" />

              <p className="font-medium">Aucun produit</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

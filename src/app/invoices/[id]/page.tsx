import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { normalizeRelation } from "@/lib/supabase/relations";
import { formatCurrency, formatDate } from "@/lib/format";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaymentForm } from "@/components/invoices/payment-form";
import { DeletePaymentButton } from "@/components/payments/delete-payment-button";
import { RefundConfirmation } from "@/components/invoices/refund-confirmation";
import { InvoiceDetailActions } from "@/components/invoices/invoice-detail-actions";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/layout/empty-state";

interface InvoicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: invoiceData, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      user_id,
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
    .eq("user_id", user.id)
    .single();

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement de la facture
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!invoiceData) {
    notFound();
  }

  const invoice = {
    ...invoiceData,
    clients: normalizeRelation(invoiceData.clients),
  };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Erreur lors du chargement du profil :",
      profileError.message,
    );
  }

  const userName =
    profile?.full_name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    "Utilisateur";

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
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{itemsError.message}</p>
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
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Erreur lors du chargement des paiements
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {paymentsError.message}
        </p>
      </div>
    );
  }

  const showPayment = invoice.status !== "paid" && invoice.status !== "overpaid";

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold md:text-[32px]">
              Facture {invoice.invoice_number}
            </h2>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(invoice.invoice_date)}
          </p>
        </div>

        <InvoiceDetailActions
          invoiceId={invoice.id}
          showPaymentLink={showPayment}
          pdf={{
            userName,
            invoice,
            items: items ?? [],
          }}
        />
      </div>

      <section className="rounded-xl border border-border bg-card p-4 md:p-6">
        <h3 className="text-xl font-semibold">Client</h3>
        <p className="mt-3 font-medium">
          {invoice.clients?.name ?? "Client inconnu"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {invoice.clients?.phone ?? "Pas de téléphone"}
        </p>
        {invoice.clients?.address ? (
          <p className="text-sm text-muted-foreground">{invoice.clients.address}</p>
        ) : null}
        {invoice.clients?.id ? (
          <Link
            href={`/clients/${invoice.clients.id}`}
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Voir le client
          </Link>
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 md:p-6">
        <h3 className="text-xl font-semibold">Produits</h3>
        {items && items.length > 0 ? (
          <>
            <div className="mt-4 space-y-3 md:hidden">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-border p-4">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                  <p className="mt-2 font-semibold">
                    {formatCurrency(item.total_amount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 hidden md:block">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 font-medium">Produit</th>
                    <th className="py-2 font-medium">Quantité</th>
                    <th className="py-2 font-medium">Prix</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="py-3 font-medium">{item.product_name}</td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 text-right font-semibold">
                        {formatCurrency(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<FileText className="size-8" />}
            title="Aucun produit"
          />
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 md:p-6">
        <h3 className="text-xl font-semibold">Résumé</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-semibold">{formatCurrency(invoice.total_amount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Payé</dt>
            <dd className="font-semibold">{formatCurrency(invoice.paid_amount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Restant</dt>
            <dd className="font-semibold">
              {formatCurrency(invoice.remaining_amount)}
            </dd>
          </div>
          {Number(invoice.refund_amount) > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">À rembourser</dt>
              <dd className="font-semibold">
                {formatCurrency(invoice.refund_amount)}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {invoice.status === "overpaid" ? (
        <RefundConfirmation
          invoiceId={invoice.id}
          refundAmount={Number(invoice.refund_amount)}
        />
      ) : showPayment ? (
        <div id="ajouter-paiement">
          <PaymentForm
            invoiceId={invoice.id}
            remainingAmount={Number(invoice.remaining_amount)}
          />
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border p-4 md:items-center"
                >
                  <div>
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payment.payment_date)}
                    </p>
                    {payment.notes ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {payment.notes}
                      </p>
                    ) : null}
                  </div>
                  <DeletePaymentButton paymentId={payment.id} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Aucun paiement enregistré"
              description="Les paiements effectués apparaîtront ici."
            />
          )}
        </CardContent>
      </Card>

      {invoice.notes ? (
        <section className="rounded-xl border border-border bg-card p-4 md:p-6">
          <h3 className="text-xl font-semibold">Notes</h3>
          <p className="mt-3 text-muted-foreground">{invoice.notes}</p>
        </section>
      ) : null}
    </PageContainer>
  );
}

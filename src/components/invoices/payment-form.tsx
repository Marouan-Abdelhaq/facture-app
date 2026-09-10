"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PaymentFormProps {
  invoiceId: string;
  remainingAmount: number;
}

export function PaymentForm({ invoiceId, remainingAmount }: PaymentFormProps) {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      setError("Veuillez saisir un montant valide.");
      return;
    }

    if (paymentAmount > remainingAmount) {
      setError(
        `Le montant ne peut pas dépasser le reste à payer (${new Intl.NumberFormat(
          "fr-MA",
          {
            style: "currency",
            currency: "MAD",
          },
        ).format(remainingAmount)}).`,
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: paymentError } = await supabase.rpc("add_payment", {
        p_invoice_id: invoiceId,
        p_amount: paymentAmount,
        p_payment_date: paymentDate,
        p_notes: notes || null,
      });

      if (paymentError) {
        throw paymentError;
      }

      setAmount("");
      setNotes("");

      router.refresh();
    } catch (error) {
      console.error("Erreur lors de l'ajout du paiement:", error);

      if (error && typeof error === "object" && "message" in error) {
        setError(String(error.message));
      } else {
        setError("Impossible d'enregistrer le paiement.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div>
          <h3 className="font-semibold">Ajouter un paiement</h3>

          <p className="text-sm text-muted-foreground">
            Reste actuellement :{" "}
            <span className="font-medium">
              {new Intl.NumberFormat("fr-MA", {
                style: "currency",
                currency: "MAD",
              }).format(remainingAmount)}
            </span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Montant */}

          <div className="space-y-2">
            <Label htmlFor="payment-amount">Montant</Label>

            <Input
              id="payment-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ex: 1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          {/* Date */}

          <div className="space-y-2">
            <Label htmlFor="payment-date">Date du paiement</Label>

            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
            />
          </div>
        </div>

        {/* Notes */}

        <div className="space-y-2">
          <Label htmlFor="payment-notes">Notes</Label>

          <Textarea
            id="payment-notes"
            placeholder="Informations supplémentaires..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            <CreditCard className="mr-2 size-4" />

            {loading ? "Ajout..." : "Enregistrer le paiement"}
          </Button>
        </div>
      </div>
    </form>
  );
}

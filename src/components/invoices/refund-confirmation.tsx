"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RefundConfirmationProps {
  invoiceId: string;
  refundAmount: number;
}

export function RefundConfirmation({
  invoiceId,
  refundAmount,
}: RefundConfirmationProps) {
  const router = useRouter();

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!confirmed) {
      setError("Veuillez confirmer que le client a bien été remboursé.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc("confirm_refund", {
        p_invoice_id: invoiceId,
        p_notes: "Remboursement confirmé",
      });

      if (error) {
        throw error;
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-4 md:p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <RotateCcw className="size-5 text-destructive" />
        </div>

        <div>
          <h3 className="font-semibold">Remboursement nécessaire</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Le client a payé un montant supérieur au total de la facture.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-background p-4 border">
        <p className="text-sm text-muted-foreground">Montant à rembourser</p>

        <p className="mt-1 text-2xl font-bold text-destructive">
          {formatCurrency(refundAmount)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="refund-confirmation"
          checked={confirmed}
          onCheckedChange={(checked) => setConfirmed(checked === true)}
        />

        <Label htmlFor="refund-confirmation" className="cursor-pointer">
          Je confirme que le client a été remboursé.
        </Label>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="button"
        variant="destructive"
        disabled={!confirmed || loading}
        onClick={handleConfirm}
      >
        <RotateCcw className="mr-2 size-4" />

        {loading ? "Confirmation..." : "Confirmer le remboursement"}
      </Button>
    </div>
  );
}

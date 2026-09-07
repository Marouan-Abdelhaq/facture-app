"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface DeletePaymentButtonProps {
  paymentId: string;
}

export function DeletePaymentButton({ paymentId }: DeletePaymentButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce paiement ?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc("delete_payment", {
        p_payment_id: paymentId,
      });

      if (error) {
        throw error;
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer le paiement.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      title="Supprimer le paiement"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

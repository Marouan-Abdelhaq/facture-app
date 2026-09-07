"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Plus, Trash2, ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Client {
  id: string;
  name: string;
  phone: string | null;
}

interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceFormProps {
  clients: Client[];
}

function createEmptyItem(): InvoiceItem {
  return {
    product_name: "",
    quantity: 1,
    unit_price: 0,
  };
}

export function InvoiceForm({ clients }: InvoiceFormProps) {
  const router = useRouter();

  const [clientId, setClientId] = useState("");

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [notes, setNotes] = useState("");

  const [itemsList, setItemsList] = useState<InvoiceItem[]>([
    createEmptyItem(),
  ]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const totalAmount = itemsList.reduce((total, item) => {
    return total + item.quantity * item.unit_price;
  }, 0);

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: string) {
    setItemsList((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]: field === "product_name" ? value : Number(value),
        };
      }),
    );
  }

  function addItem() {
    setItemsList((currentItems) => [...currentItems, createEmptyItem()]);
  }

  function removeItem(index: number) {
    if (itemsList.length === 1) {
      return;
    }

    setItemsList((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!clientId) {
      setError("Veuillez sélectionner un client.");
      return;
    }

    if (itemsList.some((item) => !item.product_name.trim())) {
      setError("Veuillez saisir le nom de chaque produit ou service.");
      return;
    }

    if (itemsList.some((item) => item.quantity <= 0 || item.unit_price < 0)) {
      setError("La quantité et le prix doivent être valides.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      /*
       * Récupérer l'utilisateur connecté
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          userError?.message ??
            "Vous devez être connecté pour créer une facture.",
        );
      }

      /*
       * 1. Créer la facture
       */
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: user.id,

          client_id: clientId,

          invoice_date: invoiceDate,

          notes: notes || null,

          total_amount: 0,

          paid_amount: 0,

          remaining_amount: 0,

          refund_amount: 0,

          status: "draft",
        })
        .select()
        .single();

      if (invoiceError) {
        throw invoiceError;
      }

      /*
       * 2. Créer les lignes de facture
       */
      const invoiceItems = itemsList.map((item) => ({
        invoice_id: invoice.id,

        product_name: item.product_name,

        quantity: item.quantity,

        unit_price: item.unit_price,

        total_amount: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) {
        throw itemsError;
      }

      /*
       * Les triggers recalculent automatiquement :
       *
       * total_amount
       * remaining_amount
       * status
       */

      /*
       * 3. Aller vers la facture
       */
      router.push(`/invoices/${invoice.id}`);

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Informations facture */}

      <div className="space-y-6 rounded-xl border bg-card p-6">
        <h3 className="font-semibold">Informations de la facture</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Client */}

          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>

            <select
              id="client"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Sélectionner un client</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}

                  {client.phone ? ` - ${client.phone}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}

          <div className="space-y-2">
            <Label htmlFor="invoice-date">Date</Label>

            <Input
              id="invoice-date"
              type="date"
              value={invoiceDate}
              onChange={(event) => setInvoiceDate(event.target.value)}
            />
          </div>
        </div>

        {/* Notes */}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>

          <Textarea
            id="notes"
            placeholder="Informations supplémentaires..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </div>

      {/* Produits */}

      <div className="space-y-6 rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Produits et services</h3>

            <p className="text-sm text-muted-foreground">
              Ajoutez les éléments de votre facture.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={addItem}>
            <Plus className="mr-2 size-4" />
            Ajouter une ligne
          </Button>
        </div>

        <div className="space-y-4">
          {itemsList.map((item, index) => {
            const itemTotal = item.quantity * item.unit_price;

            return (
              <div
                key={index}
                className="grid gap-4 rounded-lg border p-4 md:grid-cols-[1fr_120px_160px_140px_40px]"
              >
                <Input
                  placeholder="Produit ou service"
                  value={item.product_name}
                  onChange={(event) =>
                    updateItem(index, "product_name", event.target.value)
                  }
                />

                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(index, "quantity", event.target.value)
                  }
                />

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Prix"
                  value={item.unit_price}
                  onChange={(event) =>
                    updateItem(index, "unit_price", event.target.value)
                  }
                />

                <div className="flex items-center justify-end font-semibold">
                  {formatCurrency(itemTotal)}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={itemsList.length === 1}
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Total */}

        <div className="flex justify-end border-t pt-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total de la facture</p>

            <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Annuler
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer la facture"}
        </Button>
      </div>
    </form>
  );
}

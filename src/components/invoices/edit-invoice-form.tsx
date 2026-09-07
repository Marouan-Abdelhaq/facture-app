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
  id?: string;

  product_name: string;

  quantity: number;

  unit_price: number;
}

interface Invoice {
  id: string;

  client_id: string;

  invoice_number: string;

  invoice_date: string;

  notes: string | null;

  total_amount: string;

  paid_amount: string;

  remaining_amount: string;

  refund_amount: string;

  status: string;
}

interface EditInvoiceFormProps {
  invoice: Invoice;

  clients: Client[];

  items: InvoiceItem[];
}

function createEmptyItem(): InvoiceItem {
  return {
    product_name: "",
    quantity: 1,
    unit_price: 0,
  };
}

export function EditInvoiceForm({
  invoice,
  clients,
  items,
}: EditInvoiceFormProps) {
  const router = useRouter();

  /*
   * Informations facture
   */

  const [clientId, setClientId] = useState(invoice.client_id);

  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number);

  const [invoiceDate, setInvoiceDate] = useState(invoice.invoice_date);

  const [notes, setNotes] = useState(invoice.notes ?? "");

  /*
   * Produits
   */

  const [itemsList, setItemsList] = useState<InvoiceItem[]>(
    items.length > 0 ? items : [createEmptyItem()],
  );

  /*
   * États
   */

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /*
   * Calcul total
   */

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

  /*
   * Modifier produit
   */

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

  /*
   * Ajouter produit
   */

  function addItem() {
    setItemsList((currentItems) => [...currentItems, createEmptyItem()]);
  }

  /*
   * Supprimer produit
   */

  function removeItem(index: number) {
    if (itemsList.length === 1) {
      return;
    }

    setItemsList((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  /*
   * Submit
   */

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    /*
     * Validation
     */

    if (!clientId) {
      setError("Veuillez sélectionner un client.");

      return;
    }

    if (!invoiceNumber.trim()) {
      setError("Veuillez saisir le numéro de facture.");

      return;
    }

    if (itemsList.some((item) => !item.product_name.trim())) {
      setError("Veuillez saisir le nom de chaque produit.");

      return;
    }

    if (itemsList.some((item) => item.quantity <= 0)) {
      setError("La quantité doit être supérieure à zéro.");

      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      /*
       * 1. Mettre à jour facture
       */

      const paidAmount = Number(invoice.paid_amount);

      const remainingAmount = Math.max(totalAmount - paidAmount, 0);

      const refundAmount = Math.max(paidAmount - totalAmount, 0);

      let status = "unpaid";

      if (paidAmount === 0) {
        status = "unpaid";
      } else if (paidAmount < totalAmount) {
        status = "partial";
      } else if (paidAmount === totalAmount) {
        status = "paid";
      } else {
        status = "overpaid";
      }

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          client_id: clientId,

          invoice_number: invoiceNumber,

          invoice_date: invoiceDate,

          notes: notes || null,

          total_amount: totalAmount,

          remaining_amount: remainingAmount,

          refund_amount: refundAmount,

          status,
        })
        .eq("id", invoice.id);

      if (invoiceError) {
        throw invoiceError;
      }

      /*
       * 2. Supprimer anciennes lignes
       */

      const { error: deleteItemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", invoice.id);

      if (deleteItemsError) {
        throw deleteItemsError;
      }

      /*
       * 3. Créer nouvelles lignes
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
       * 4. Redirection
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
      {/* Erreur */}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Informations */}

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

          {/* Numéro */}

          <div className="space-y-2">
            <Label htmlFor="invoice-number">Numéro de facture</Label>

            <Input
              id="invoice-number"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
            />
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
              Modifiez les éléments de la facture.
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
                {/* Produit */}

                <Input
                  placeholder="Produit ou service"
                  value={item.product_name}
                  onChange={(event) =>
                    updateItem(index, "product_name", event.target.value)
                  }
                />

                {/* Quantité */}

                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={item.quantity}
                  onChange={(event) =>
                    updateItem(index, "quantity", event.target.value)
                  }
                />

                {/* Prix */}

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(event) =>
                    updateItem(index, "unit_price", event.target.value)
                  }
                />

                {/* Total */}

                <div className="flex items-center justify-end font-semibold">
                  {formatCurrency(itemTotal)}
                </div>

                {/* Supprimer */}

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
            <p className="text-sm text-muted-foreground">Nouveau total</p>

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
          {loading ? "Modification..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}

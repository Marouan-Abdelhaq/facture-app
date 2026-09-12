"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import {
  InvoiceItemsEditor,
  type InvoiceItemDraft,
} from "@/components/invoices/invoice-items-editor";

interface Client {
  id: string;
  name: string;
  phone: string | null;
}

interface InvoiceFormProps {
  clients: Client[];
}

function createEmptyItem(): InvoiceItemDraft {
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
  const [itemsList, setItemsList] = useState<InvoiceItemDraft[]>([
    createEmptyItem(),
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = itemsList.reduce((total, item) => {
    return total + item.quantity * item.unit_price;
  }, 0);

  function updateItem(
    index: number,
    field: keyof InvoiceItemDraft,
    value: string,
  ) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
        <h2 className="text-xl font-semibold">Informations</h2>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <select
              id="client"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm md:h-10"
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

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Informations supplémentaires..."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
        <h2 className="text-xl font-semibold">Produits</h2>
        <InvoiceItemsEditor
          items={itemsList}
          onChangeItem={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />
      </section>

      <section className="hidden items-center justify-between rounded-xl border border-border bg-card p-6 md:flex">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer la facture"}
          </Button>
        </div>
      </section>

      <MobileActionBar>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
          </div>
          <Button type="submit" disabled={loading} className="min-w-40">
            {loading ? "Création..." : "Créer la facture"}
          </Button>
        </div>
      </MobileActionBar>
    </form>
  );
}

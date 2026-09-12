"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";

export interface InvoiceItemDraft {
  id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceItemsEditorProps {
  items: InvoiceItemDraft[];
  onChangeItem: (index: number, field: keyof InvoiceItemDraft, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function InvoiceItemsEditor({
  items,
  onChangeItem,
  onAddItem,
  onRemoveItem,
}: InvoiceItemsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="hidden grid-cols-[1fr_120px_140px_120px_44px] gap-3 px-1 text-xs font-medium text-muted-foreground md:grid">
        <span>Produit</span>
        <span>Quantité</span>
        <span>Prix</span>
        <span className="text-right">Total</span>
        <span className="sr-only">Supprimer</span>
      </div>

      {items.map((item, index) => {
        const itemTotal = item.quantity * item.unit_price;

        return (
          <div
            key={item.id ?? index}
            className="space-y-3 rounded-xl border border-border bg-card p-4 md:grid md:grid-cols-[1fr_120px_140px_120px_44px] md:items-end md:gap-3 md:space-y-0 md:p-3"
          >
            <div className="space-y-2">
              <Label htmlFor={`product-${index}`}>Produit</Label>
              <Input
                id={`product-${index}`}
                placeholder="Nom du produit"
                value={item.product_name}
                onChange={(event) =>
                  onChangeItem(index, "product_name", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`quantity-${index}`}>Quantité</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Diminuer la quantité"
                  onClick={() =>
                    onChangeItem(
                      index,
                      "quantity",
                      String(Math.max(1, item.quantity - 1)),
                    )
                  }
                >
                  <Minus className="size-4" />
                </Button>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  step="1"
                  className="text-center"
                  value={item.quantity}
                  onChange={(event) =>
                    onChangeItem(index, "quantity", event.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Augmenter la quantité"
                  onClick={() =>
                    onChangeItem(index, "quantity", String(item.quantity + 1))
                  }
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`price-${index}`}>Prix</Label>
              <Input
                id={`price-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={(event) =>
                  onChangeItem(index, "unit_price", event.target.value)
                }
              />
            </div>

            <div className="flex items-end justify-between md:block md:text-right">
              <p className="text-sm text-muted-foreground md:hidden">Total</p>
              <p className="font-semibold">{formatCurrency(itemTotal)}</p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="w-full text-destructive hover:text-destructive md:w-auto"
              disabled={items.length === 1}
              aria-label="Supprimer le produit"
              onClick={() => onRemoveItem(index)}
            >
              <Trash2 className="size-4" />
              <span className="md:hidden">Supprimer</span>
            </Button>
          </div>
        );
      })}

      <Button type="button" variant="outline" className="w-full md:w-auto" onClick={onAddItem}>
        <Plus className="mr-2 size-4" />
        Ajouter un produit
      </Button>
    </div>
  );
}

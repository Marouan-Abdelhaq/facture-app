"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DownloadInvoicePdf } from "@/components/invoices/download-invoice-pdf";

import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button";

interface InvoiceDetailActionsProps {
  invoiceId: string;

  invoiceNumber: string;

  showPaymentLink: boolean;

  pdf: {
    userName: string;
    invoice: ComponentProps<typeof DownloadInvoicePdf>["invoice"];
    items: ComponentProps<typeof DownloadInvoicePdf>["items"];
  };
}

export function InvoiceDetailActions({
  invoiceId,
  invoiceNumber,
  showPaymentLink,
  pdf,
}: InvoiceDetailActionsProps) {
  return (
    <>
      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <DownloadInvoicePdf {...pdf} />
        <Button variant="outline" asChild>
          <Link href={`/invoices/${invoiceId}/edit`}>
            <Pencil className="size-4" />
            Modifier
          </Link>
        </Button>
        <DeleteInvoiceButton
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber}
        />
        {showPaymentLink ? (
          <Button asChild>
            <a href="#ajouter-paiement">Ajouter un paiement</a>
          </Button>
        ) : null}
      </div>

      <div className="flex gap-2 md:hidden">
        <Button asChild className="flex-1">
          <Link href={`/invoices/${invoiceId}/edit`}>
            <Pencil className="size-4" />
            Modifier
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Plus d'actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <div className="px-1 py-1">
              <DownloadInvoicePdf {...pdf} />
            </div>

            {showPaymentLink ? (
              <DropdownMenuItem asChild className="min-h-11">
                <a href="#ajouter-paiement">Ajouter un paiement</a>
              </DropdownMenuItem>
            ) : null}

            <div className="my-1 border-t border-border" />

            <div className="px-1 py-1">
              <DeleteInvoiceButton
                invoiceId={invoiceId}
                invoiceNumber={invoiceNumber}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

interface InvoicePdfProps {
  invoice: DownloadInvoicePdfProps["invoice"];
  items: DownloadInvoicePdfProps["items"];
}

type InvoicePdfComponent = ComponentType<InvoicePdfProps>;
type PdfDownloadLinkComponent =
  typeof import("@react-pdf/renderer").PDFDownloadLink;

interface LoadedPdfComponents {
  invoicePdf: InvoicePdfComponent;
  pdfDownloadLink: PdfDownloadLinkComponent;
}

interface DownloadInvoicePdfProps {
  invoice: {
    invoice_number: string;
    invoice_date: string;
    notes: string | null;
    total_amount: number | string;
    paid_amount: number | string;
    remaining_amount: number | string;
    refund_amount: number | string;
    status: string;
    clients: {
      name: string;
      phone: string | null;
      address: string | null;
    } | null;
  };

  items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number | string;
    total_amount: number | string;
  }[];
}

export function DownloadInvoicePdf({
  invoice,
  items,
}: DownloadInvoicePdfProps) {
  const [pdfComponents, setPdfComponents] =
    useState<LoadedPdfComponents | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/invoices/invoice-pdf"),
    ]).then(([renderer, invoicePdfModule]) => {
      if (!mounted) {
        return;
      }

      setPdfComponents({
        invoicePdf: invoicePdfModule.InvoicePdf,
        pdfDownloadLink: renderer.PDFDownloadLink,
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!pdfComponents) {
    return (
      <Button type="button" variant="outline" disabled>
        <Download className="mr-2 size-4" />
        Préparation du PDF...
      </Button>
    );
  }

  const { invoicePdf: InvoicePdf, pdfDownloadLink: PDFDownloadLink } =
    pdfComponents;

  return (
    <PDFDownloadLink
      document={<InvoicePdf invoice={invoice} items={items} />}
      fileName={`facture-${invoice.invoice_number}.pdf`}
    >
      {({ loading }) => (
        <Button type="button" variant="outline" disabled={loading}>
          <Download className="mr-2 size-4" />

          {loading ? "Préparation du PDF..." : "Télécharger le PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

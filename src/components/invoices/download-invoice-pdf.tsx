"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import { Download, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface InvoicePdfProps {
  invoice: DownloadInvoicePdfProps["invoice"];
  items: DownloadInvoicePdfProps["items"];
  userName: string;
}

type InvoicePdfComponent = ComponentType<InvoicePdfProps>;
type PdfFunction = typeof import("@react-pdf/renderer").pdf;

interface LoadedPdfComponents {
  invoicePdf: InvoicePdfComponent;
  pdf: PdfFunction;
}

interface DownloadInvoicePdfProps {
  userName: string;
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

function sanitizeFileName(value: string, fallback: string) {
  const sanitized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || fallback;
}

function getPdfFileName(invoice: DownloadInvoicePdfProps["invoice"]) {
  const invoiceNumber = sanitizeFileName(invoice.invoice_number, "Sans-numero");
  const clientName = sanitizeFileName(
    invoice.clients?.name ?? "",
    "Client-inconnu",
  );

  return `Facture_${invoiceNumber}_${clientName}.pdf`;
}

function canSharePdfFiles() {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.share !== "function" ||
    typeof navigator.canShare !== "function"
  ) {
    return false;
  }

  try {
    return navigator.canShare({
      files: [
        new File([""], "facture.pdf", {
          type: "application/pdf",
        }),
      ],
    });
  } catch {
    return false;
  }
}

export function DownloadInvoicePdf({
  invoice,
  items,
  userName,
}: DownloadInvoicePdfProps) {
  const [pdfComponents, setPdfComponents] =
    useState<LoadedPdfComponents | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const shareSupported = useSyncExternalStore(
    () => () => undefined,
    canSharePdfFiles,
    () => false,
  );

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
        pdf: renderer.pdf,
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

  const { invoicePdf: InvoicePdf, pdf } = pdfComponents;
  const fileName = getPdfFileName(invoice);

  async function getPdfBlob() {
    if (pdfBlob) {
      return pdfBlob;
    }

    const blob = await pdf(
      <InvoicePdf invoice={invoice} items={items} userName={userName} />,
    ).toBlob();

    setPdfBlob(blob);
    return blob;
  }

  async function handleDownload() {
    setLoading(true);

    try {
      const blob = await getPdfBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    if (!shareSupported) {
      return;
    }

    setLoading(true);

    try {
      const blob = await getPdfBlob();
      const file = new File([blob], fileName, {
        type: "application/pdf",
      });

      if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
        return;
      }

      await navigator.share({
        title: `Facture ${invoice.invoice_number}`,
        text: `Voici votre facture ${invoice.invoice_number}`,
        files: [file],
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Erreur lors du partage du PDF:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleDownload}
        disabled={loading}
      >
        <Download className="size-4" />
        {loading ? "Préparation du PDF..." : "Télécharger PDF"}
      </Button>

      {shareSupported && (
        <Button
          type="button"
          variant="outline"
          onClick={handleShare}
          disabled={loading}
        >
          <Share2 className="size-4" />
          Partager
        </Button>
      )}
    </div>
  );
}

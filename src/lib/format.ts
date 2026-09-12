export function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  unpaid: "Non payée",
  partial: "Partiellement payée",
  paid: "Payée",
  overpaid: "Trop payée",
  cancelled: "Annulée",
};

export function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

export type InvoiceStatus =
  | "draft"
  | "unpaid"
  | "partial"
  | "paid"
  | "overpaid"
  | "cancelled";

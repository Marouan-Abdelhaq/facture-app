import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface InvoicePdfProps {
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
    profiles: {
      full_name: string | null;
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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  companySection: {
    width: "50%",
  },

  companyName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },

  companyText: {
    color: "#4b5563",
    marginBottom: 4,
  },

  invoiceSection: {
    width: "40%",
    alignItems: "flex-end",
  },

  invoiceTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },

  invoiceNumber: {
    fontSize: 12,
    marginBottom: 5,
  },

  status: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
  },

  clientSection: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },

  clientName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },

  clientText: {
    color: "#4b5563",
    marginBottom: 4,
  },

  table: {
    width: "100%",
    marginTop: 10,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111827",
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },

  product: {
    width: "40%",
  },

  quantity: {
    width: "15%",
    textAlign: "center",
  },

  price: {
    width: "20%",
    textAlign: "right",
  },

  total: {
    width: "25%",
    textAlign: "right",
  },

  summary: {
    marginTop: 30,
    marginLeft: "50%",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  summaryLabel: {
    color: "#4b5563",
  },

  summaryValue: {
    fontFamily: "Helvetica-Bold",
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#111827",
    paddingTop: 10,
    marginTop: 5,
  },

  totalLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },

  totalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },

  notes: {
    marginTop: 35,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  notesText: {
    color: "#4b5563",
    marginTop: 5,
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 9,
  },
});

function formatCurrency(amount: number | string) {
  return `${Number(amount).toFixed(2)} MAD`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    unpaid: "Non payée",
    partial: "Partiellement payée",
    paid: "Payée",
    overpaid: "À rembourser",
    cancelled: "Annulée",
  };

  return labels[status] ?? status;
}

export function InvoicePdf({ invoice, items }: InvoicePdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}

        <View style={styles.header}>
          {/* ENTREPRISE */}

          <View style={styles.companySection}>
            <Text style={styles.companyName}>
              {invoice.profiles?.full_name ?? "Utilisateur"}
            </Text>
          </View>

          {/* FACTURE */}

          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceTitle}>FACTURE</Text>

            <Text style={styles.invoiceNumber}>
              N° {invoice.invoice_number}
            </Text>

            <Text>Date : {formatDate(invoice.invoice_date)}</Text>

            <Text style={styles.status}>{getStatusLabel(invoice.status)}</Text>
          </View>
        </View>

        {/* CLIENT */}

        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>FACTURÉ À</Text>

          <Text style={styles.clientName}>
            {invoice.clients?.name ?? "Client inconnu"}
          </Text>

          {invoice.clients?.phone && (
            <Text style={styles.clientText}>
              Téléphone : {invoice.clients.phone}
            </Text>
          )}

          {invoice.clients?.address && (
            <Text style={styles.clientText}>
              Adresse : {invoice.clients.address}
            </Text>
          )}
        </View>

        {/* TABLE */}

        <View style={styles.table}>
          {/* HEADER */}

          <View style={styles.tableHeader}>
            <Text style={styles.product}>Produit / Service</Text>

            <Text style={styles.quantity}>Qté</Text>

            <Text style={styles.price}>Prix</Text>

            <Text style={styles.total}>Total</Text>
          </View>

          {/* ITEMS */}

          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.product}>{item.product_name}</Text>

              <Text style={styles.quantity}>{item.quantity}</Text>

              <Text style={styles.price}>
                {formatCurrency(item.unit_price)}
              </Text>

              <Text style={styles.total}>
                {formatCurrency(item.total_amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* SUMMARY */}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(invoice.total_amount)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Montant payé</Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(invoice.paid_amount)}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Reste à payer</Text>

            <Text style={styles.totalValue}>
              {formatCurrency(invoice.remaining_amount)}
            </Text>
          </View>
        </View>

        {/* NOTES */}

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notes</Text>

            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* FOOTER */}

        <Text style={styles.footer}>
          Merci pour votre confiance —{" "}
          {invoice.profiles?.full_name ?? "Utilisateur"}
        </Text>
      </Page>
    </Document>
  );
}

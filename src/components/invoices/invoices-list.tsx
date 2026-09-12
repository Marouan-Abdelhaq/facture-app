"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { InvoiceCard } from "@/components/invoices/invoice-card";
import { EmptyState } from "@/components/layout/empty-state";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  invoice_date: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  refund_amount: string;
  clients: {
    name: string;
  } | null;
}

interface InvoicesListProps {
  invoices: Invoice[];
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredInvoices = invoices.filter((invoice) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchValue) ||
      (invoice.clients?.name ?? "").toLowerCase().includes(searchValue);

    const matchesStatus = status === "all" || invoice.status === status;

    const invoiceDate = new Date(invoice.invoice_date);
    const today = new Date();
    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate = invoiceDate.toDateString() === today.toDateString();
    }

    if (dateFilter === "week") {
      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      startOfWeek.setDate(today.getDate() + diff);
      startOfWeek.setHours(0, 0, 0, 0);
      matchesDate = invoiceDate >= startOfWeek;
    }

    if (dateFilter === "month") {
      matchesDate =
        invoiceDate.getMonth() === today.getMonth() &&
        invoiceDate.getFullYear() === today.getFullYear();
    }

    if (dateFilter === "last_month") {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      matchesDate =
        invoiceDate.getMonth() === lastMonth.getMonth() &&
        invoiceDate.getFullYear() === lastMonth.getFullYear();
    }

    if (dateFilter === "year") {
      matchesDate = invoiceDate.getFullYear() === today.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute top-3.5 left-3 size-4 text-muted-foreground md:top-3" />
        <Input
          placeholder="Rechercher une facture ou un client..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-10"
          aria-label="Rechercher une facture"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="flex h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm md:h-10"
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous les statuts</option>
          <option value="paid">Payée</option>
          <option value="partial">Partiellement payée</option>
          <option value="unpaid">Non payée</option>
          <option value="overpaid">Trop payée</option>
          <option value="cancelled">Annulée</option>
        </select>

        <select
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="flex h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm md:h-10"
          aria-label="Filtrer par date"
        >
          <option value="all">Toutes les dates</option>
          <option value="today">Aujourd&apos;hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="last_month">Le mois dernier</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredInvoices.length} facture(s)
      </p>

      {filteredInvoices.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                id={invoice.id}
                invoiceNumber={invoice.invoice_number}
                clientName={invoice.clients?.name ?? "Client inconnu"}
                invoiceDate={invoice.invoice_date}
                totalAmount={invoice.total_amount}
                status={invoice.status}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Numéro</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Montant</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-b-0">
                    <td className="px-5 py-3 font-medium">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-5 py-3">
                      {invoice.clients?.name ?? "Client inconnu"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState
          title="Aucune facture trouvée"
          description="Essayez de modifier votre recherche ou vos filtres."
        />
      )}
    </div>
  );
}

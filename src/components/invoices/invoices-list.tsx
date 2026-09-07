"use client";

import { useState } from "react";

import Link from "next/link";

import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-MA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    unpaid: "Non payée",
    partial: "Partielle",
    paid: "Payée",
    overpaid: "À rembourser",
    cancelled: "Annulée",
  };

  return labels[status] ?? status;
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredInvoices = invoices.filter((invoice) => {
    /*
     * Recherche
     */

    const searchValue = search.toLowerCase();

    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchValue) ||
      (invoice.clients?.name ?? "").toLowerCase().includes(searchValue);

    /*
     * Statut
     */

    const matchesStatus = status === "all" || invoice.status === status;

    /*
     * Date
     */

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
    <div className="space-y-6">
      {/* Recherche */}

      <div className="relative">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

        <Input
          placeholder="Rechercher une facture ou un client..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtres */}

      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Statut */}

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-[220px]"
        >
          <option value="all">Tous les statuts</option>

          <option value="paid">Payée</option>

          <option value="partial">Partielle</option>

          <option value="unpaid">Non payée</option>

          <option value="overpaid">À rembourser</option>

          <option value="cancelled">Annulée</option>
        </select>

        {/* Date */}

        <select
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-[220px]"
        >
          <option value="all">Toutes les dates</option>

          <option value="today">Aujourd&apos;hui</option>

          <option value="week">Cette semaine</option>

          <option value="month">Ce mois</option>

          <option value="last_month">Le mois dernier</option>

          <option value="year">Cette année</option>
        </select>
      </div>

      {/* Résultats */}

      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          {filteredInvoices.length} facture(s) trouvée(s)
        </p>

        {filteredInvoices.length > 0 ? (
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="flex flex-col gap-4 rounded-lg border p-4 transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Informations */}

                <div>
                  <p className="font-semibold">{invoice.invoice_number}</p>

                  <p className="text-sm text-muted-foreground">
                    {invoice.clients?.name ?? "Client inconnu"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {formatDate(invoice.invoice_date)}
                  </p>
                </div>

                {/* Montant + Statut */}

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>

                    <p className="font-semibold">
                      {formatCurrency(invoice.total_amount)}
                    </p>
                  </div>

                  <Badge variant="secondary">
                    {getStatusLabel(invoice.status)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border py-12 text-center">
            <p className="font-medium">Aucune facture trouvée</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Essayez de modifier votre recherche ou vos filtres.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

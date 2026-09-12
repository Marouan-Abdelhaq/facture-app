"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";

import { ClientCard } from "@/components/clients/client-card";
import { EmptyState } from "@/components/layout/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";

interface Client {
  client_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  total_invoices: number;
  total_sales: string;
  total_received: string;
  total_refunded: string;
  net_paid: string;
  total_credit: string;
}

interface ClientsListProps {
  clients: Client[];
}

function hasCredit(amount: string | number) {
  return Number(amount) > 0;
}

export function ClientsList({ clients }: ClientsListProps) {
  const [search, setSearch] = useState("");
  const [creditFilter, setCreditFilter] = useState("all");

  const filteredClients = clients.filter((client) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      client.name.toLowerCase().includes(searchValue) ||
      (client.phone ?? "").toLowerCase().includes(searchValue) ||
      (client.address ?? "").toLowerCase().includes(searchValue);

    const clientHasCredit = hasCredit(client.total_credit);

    const matchesCredit =
      creditFilter === "all" ||
      (creditFilter === "with-credit" && clientHasCredit) ||
      (creditFilter === "without-credit" && !clientHasCredit);

    return matchesSearch && matchesCredit;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-3.5 left-3 size-4 text-muted-foreground md:top-3" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
            aria-label="Rechercher un client"
          />
        </div>

        <Select value={creditFilter} onValueChange={setCreditFilter}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filtrer les clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les clients</SelectItem>
            <SelectItem value="with-credit">Avec crédit</SelectItem>
            <SelectItem value="without-credit">Sans crédit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredClients.length} client(s)
      </p>

      {filteredClients.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.client_id}
                id={client.client_id}
                name={client.name}
                phone={client.phone}
                totalInvoices={client.total_invoices}
                totalSales={client.total_sales}
                totalCredit={client.total_credit}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Téléphone</th>
                  <th className="px-5 py-3 font-medium">Factures</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Crédit</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.client_id} className="border-b last:border-b-0">
                    <td className="px-5 py-3 font-medium">{client.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {client.phone ?? "—"}
                    </td>
                    <td className="px-5 py-3">{client.total_invoices}</td>
                    <td className="px-5 py-3 font-medium">
                      {formatCurrency(client.total_sales)}
                    </td>
                    <td className="px-5 py-3">
                      {hasCredit(client.total_credit) ? (
                        <span className="font-medium text-warning">
                          {formatCurrency(client.total_credit)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/clients/${client.client_id}`}
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
          icon={<Users className="size-8" />}
          title="Aucun client trouvé"
          description="Essayez de modifier votre recherche."
        />
      )}
    </div>
  );
}

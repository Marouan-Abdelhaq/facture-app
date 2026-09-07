"use client";

import { useState } from "react";

import Link from "next/link";

import { Search, Users, CheckCircle2, TriangleAlert } from "lucide-react";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(Number(amount));
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
    <div className="space-y-6">
      {/* Recherche et filtre */}

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Recherche */}

        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />

          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtre crédit */}

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

      {/* Résultats */}

      <p className="text-sm text-muted-foreground">
        {filteredClients.length} client(s) trouvé(s)
      </p>

      {/* Liste */}

      {filteredClients.length > 0 ? (
        <div className="overflow-hidden rounded-xl border">
          {/* Header */}

          <div className="hidden grid-cols-[2fr_1.5fr_1.5fr_1fr] gap-4 border-b bg-muted/50 px-6 py-4 text-sm font-medium text-muted-foreground md:grid">
            <div>Client</div>

            <div>Téléphone</div>

            <div>Total ventes</div>

            <div className="text-right">Crédit</div>
          </div>

          {/* Clients */}

          <div className="divide-y">
            {filteredClients.map((client) => (
              <Link
                key={client.client_id}
                href={`/clients/${client.client_id}`}
                className="grid gap-3 px-6 py-4 transition-colors hover:bg-muted/50 md:grid-cols-[2fr_1.5fr_1.5fr_1fr] md:items-center md:gap-4"
              >
                {/* Client */}

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <Users className="size-4 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="font-medium">{client.name}</p>

                    {client.address && (
                      <p className="text-sm text-muted-foreground">
                        {client.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Téléphone */}

                <div className="text-sm text-muted-foreground">
                  {client.phone ?? "—"}
                </div>

                {/* Total ventes */}

                <div>
                  <p className="text-sm text-muted-foreground md:hidden">
                    Total ventes
                  </p>

                  <p className="font-medium">
                    {formatCurrency(client.total_sales)}
                  </p>
                </div>

                {/* Crédit */}

                {/* Crédit */}

                <div className="md:text-right">
                  <p className="text-sm text-muted-foreground md:hidden">
                    Crédit
                  </p>

                  {hasCredit(client.total_credit) ? (
                    <div className="flex items-center gap-2 md:justify-end">
                      <TriangleAlert className="size-4 text-destructive" />

                      <div>
                        <p className="font-semibold text-destructive">
                          {formatCurrency(client.total_credit)}
                        </p>

                        <p className="text-xs text-muted-foreground">À payer</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 md:justify-end">
                      <CheckCircle2 className="size-4 text-green-600" />

                      <div>
                        <p className="font-semibold">Aucun crédit</p>

                        <p className="text-xs text-muted-foreground">
                          Client à jour
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border py-12 text-center">
          <Users className="mb-3 size-10 text-muted-foreground" />

          <p className="font-medium">Aucun client trouvé</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Essayez de modifier votre recherche.
          </p>
        </div>
      )}
    </div>
  );
}

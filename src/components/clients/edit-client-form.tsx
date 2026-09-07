"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ArrowLeft, Save } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Client {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
}

interface EditClientFormProps {
  client: Client;
}

export function EditClientForm({ client }: EditClientFormProps) {
  const router = useRouter();

  const [name, setName] = useState(client.name);

  const [phone, setPhone] = useState(client.phone ?? "");

  const [address, setAddress] = useState(client.address ?? "");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Veuillez saisir le nom du client.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("clients")
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
        })
        .eq("id", client.id);

      if (error) {
        throw error;
      }

      router.push(`/clients/${client.id}`);

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le client.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 space-y-6">
        <h3 className="font-semibold">Informations du client</h3>

        {/* Nom */}

        <div className="space-y-2">
          <Label htmlFor="name">Nom du client</Label>

          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex: Ahmed"
          />
        </div>

        {/* Téléphone */}

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>

          <Input
            id="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Ex: 0612345678"
          />
        </div>

        {/* Adresse */}

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>

          <Input
            id="address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Ex: Marrakech"
          />
        </div>
      </div>

      {/* Actions */}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Annuler
        </Button>

        <Button type="submit" disabled={loading}>
          <Save className="mr-2 size-4" />

          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  );
}

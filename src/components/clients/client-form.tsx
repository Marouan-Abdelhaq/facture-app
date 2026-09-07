"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

export function ClientForm() {
  const router = useRouter();

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    setError("");

    try {
      const supabase = createClient();

      /*
       * Récupérer l'utilisateur connecté
       */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Utilisateur non authentifié.");
      }

      /*
       * Créer le client
       */

      const { error: insertError } = await supabase.from("clients").insert({
        user_id: user.id,

        name,

        phone: phone || null,

        address: address || null,

        notes: notes || null,
      });

      if (insertError) {
        throw insertError;
      }

      router.push("/clients");

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom du client *</Label>

        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Exemple : Ahmed"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>

        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Exemple : 0612345678"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>

        <Input
          id="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Exemple : Marrakech"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>

        <Textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Informations supplémentaires..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Créer le client"}
        </Button>
      </div>
    </form>
  );
}

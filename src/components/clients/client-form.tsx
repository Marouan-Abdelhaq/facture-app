"use client";

import { useState, useSyncExternalStore } from "react";

import { useRouter } from "next/navigation";
import { Smartphone } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

interface ContactPickerContact {
  name?: string[];
  tel?: string[];
}

interface ContactsManager {
  select(
    properties: string[],
    options?: { multiple?: boolean },
  ): Promise<ContactPickerContact[]>;
}

function getContactsManager(): ContactsManager | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  const contacts = (
    navigator as Navigator & { contacts?: Partial<ContactsManager> }
  ).contacts;

  return contacts && typeof contacts.select === "function"
    ? (contacts as ContactsManager)
    : null;
}

export function ClientForm() {
  const router = useRouter();

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [notes, setNotes] = useState("");

  const [contactsLoading, setContactsLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const contactsSupported = useSyncExternalStore(
    () => () => undefined,
    () => getContactsManager() !== null,
    () => false,
  );

  async function handleImportContact() {
    const contactsManager = getContactsManager();

    if (!contactsManager) {
      return;
    }

    setContactsLoading(true);
    setError("");

    try {
      const contacts = await contactsManager.select(["name", "tel"], {
        multiple: false,
      });
      const contact = contacts[0];
      const contactName = contact?.name?.[0]?.trim();
      const contactPhone = contact?.tel?.[0]?.trim();

      if (contactName) {
        setName(contactName);
      }

      if (contactPhone) {
        setPhone(contactPhone);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Erreur lors de l'import du contact:", error);
      setError("Impossible d'importer ce contact.");
    } finally {
      setContactsLoading(false);
    }
  }

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

      {contactsSupported && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleImportContact}
          disabled={contactsLoading}
        >
          <Smartphone className="size-4" />
          {contactsLoading
            ? "Ouverture des contacts..."
            : "Importer depuis mes contacts"}
        </Button>
      )}

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

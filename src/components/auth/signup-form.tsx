"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");

      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");

      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,

        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          throw new Error("Cette adresse email est déjà utilisée.");
        }

        throw error;
      }

      if (data.session) {
        router.push("/");
        router.refresh();

        return;
      }

      setSuccess(
        "Compte créé avec succès. Vérifiez votre email pour confirmer votre compte.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de créer le compte.",
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

      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>

        <Input
          id="name"
          type="text"
          placeholder="Votre nom"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>

        <Input
          id="email"
          type="email"
          placeholder="exemple@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>

        <Input
          id="password"
          type="password"
          placeholder="Minimum 6 caractères"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>

        <Input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        <UserPlus className="mr-2 size-4" />

        {loading ? "Création..." : "Créer mon compte"}
      </Button>
    </form>
  );
}

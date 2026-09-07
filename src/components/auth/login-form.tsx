"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { LogIn } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    setLoading(true);

    try {
      const supabase = createClient();

      let email = identifier.trim();

      /*
       * Si l'utilisateur n'a pas écrit un email,
       * on considère qu'il a écrit son nom complet.
       */

      if (!identifier.includes("@")) {
        const { data: foundEmail, error: profileError } = await supabase.rpc(
          "get_email_by_full_name",
          {
            p_full_name: identifier.trim(),
          },
        );

        if (profileError || !foundEmail) {
          throw new Error("Utilisateur introuvable.");
        }

        email = foundEmail;
      }

      /*
       * Connexion Supabase
       */

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        if (
          loginError.message.toLowerCase().includes("invalid login credentials")
        ) {
          throw new Error("Identifiant ou mot de passe incorrect.");
        }

        throw loginError;
      }

      router.push("/");

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error ? error.message : "Impossible de se connecter.",
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
        <Label htmlFor="identifier">Email ou nom complet</Label>

        <Input
          id="identifier"
          type="text"
          placeholder="exemple@email.com ou votre nom"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>

        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        <LogIn className="mr-2 size-4" />

        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}

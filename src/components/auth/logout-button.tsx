"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.push("/login");

      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-auto min-w-0 flex-1 justify-center gap-3 text-muted-foreground hover:text-destructive md:w-full md:flex-none md:justify-start"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="size-5" />

      {loading ? "Déconnexion..." : "Se déconnecter"}
    </Button>
  );
}

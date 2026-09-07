import Link from "next/link";
import { Receipt } from "lucide-react";

import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md space-y-7">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-sm border border-[#c94c4c]/40 bg-primary text-primary-foreground shadow-[3px_3px_0_rgba(30,58,95,0.15)]">
            <Receipt className="size-6" />
          </div>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c94c4c]">
            Cahier de facturation
          </p>

          <h1 className="text-3xl text-primary">Créer votre compte</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Commencez à gérer vos clients et vos factures.
          </p>
        </div>

        <div className="rounded-sm border border-border bg-card p-5 shadow-[3px_4px_0_rgba(30,58,95,0.05)] sm:p-6">
          <SignupForm />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}

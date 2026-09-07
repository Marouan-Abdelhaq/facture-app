import { CalendarDays } from "lucide-react";

export function Header() {
  const today = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-border/80 bg-card/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#c94c4c]">
          Mon cahier
        </p>

        <h1 className="text-2xl text-primary">Tableau de bord</h1>

        <p className="hidden text-sm text-muted-foreground sm:block">
          Vue générale de votre activité
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
        <CalendarDays className="size-4" />

        <span>{today}</span>
      </div>
    </header>
  );
}

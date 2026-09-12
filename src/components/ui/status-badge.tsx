import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/format";

const statusClassName: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  unpaid: "bg-warning/10 text-warning",
  partial: "bg-info/10 text-info",
  paid: "bg-success/10 text-success",
  overpaid: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  cancelled: "bg-muted text-muted-foreground",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        statusClassName[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

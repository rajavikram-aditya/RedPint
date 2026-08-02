import { cn } from "@/lib/utils";
import { URGENCY_META, type BloodGroup, type Urgency } from "@/lib/redpint-data";

export function GroupChip({
  group,
  className,
  size = "md",
}: {
  group: BloodGroup;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-sm border border-primary/25 bg-primary/10 font-mono font-bold text-primary tabular-nums",
        size === "sm" && "size-7 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-14 text-lg",
        className,
      )}
    >
      {group}
    </span>
  );
}

export function UrgencyBadge({ urgency, className }: { urgency: Urgency; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        urgency === "critical" && "bg-critical text-critical-foreground",
        urgency === "urgent" && "bg-urgent text-urgent-foreground",
        urgency === "routine" && "bg-routine text-routine-foreground",
        className,
      )}
    >
      {urgency === "critical" && (
        <span className="size-1.5 animate-pulse rounded-full bg-critical-foreground" />
      )}
      {URGENCY_META[urgency].label}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <p className="label-eyebrow">{eyebrow}</p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
          </div>
          {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}

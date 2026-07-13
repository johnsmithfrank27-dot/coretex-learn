import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon, title, description, actionLabel, actionTo, onAction, image,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  image?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center shadow-soft">
      {image ? (
        <img src={image} alt="" className="mx-auto mb-6 h-32 w-32 rounded-3xl object-cover opacity-80" />
      ) : (
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-soft text-primary">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && (actionTo || onAction) && (
        actionTo ? (
          <Link to={actionTo} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition-all">
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
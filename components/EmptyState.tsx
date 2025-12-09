/**
 * Empty State Component
 *
 * Shows a friendly message when there's no data to display.
 * Uses warm accent for the action button.
 */

import Link from "next/link";

type Props = {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({
  icon = "📍",
  title,
  description,
  actionLabel,
  actionHref,
}: Props) {
  return (
    <div className="border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 sm:p-12 text-center">
      <span className="text-5xl mb-4 block">{icon}</span>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[var(--color-foreground-secondary)] mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary inline-block">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

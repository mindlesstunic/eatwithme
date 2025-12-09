/**
 * Empty State Component
 *
 * Shows a friendly message when there's no data to display.
 * Can include an icon, title, description, and action button.
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
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

/**
 * Recommendation Card Component
 *
 * Displays a single recommendation with edit/delete actions.
 * Uses card styling with warm accents.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  recommendation: {
    id: string;
    dishes: string[];
    videoUrl: string | null;
    isSponsored: boolean;
    notes: string | null;
    place: {
      id: string;
      name: string;
      address: string;
    };
  };
};

export default function RecommendationCard({ recommendation }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    const res = await fetch("/api/recommendation/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recommendationId: recommendation.id,
      }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete recommendation");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="card">
      {/* ============================================
          Place Info
          ============================================ */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/place/${recommendation.place.id}`}
            className="font-semibold text-lg hover:text-[var(--color-primary)] transition-colors"
          >
            {recommendation.place.name}
          </Link>
          <p className="text-[var(--color-foreground-secondary)] text-sm mt-1">
            {recommendation.place.address}
          </p>
        </div>

        {recommendation.isSponsored && (
          <span className="badge-sponsored">Sponsored</span>
        )}
      </div>

      {/* ============================================
          Recommendation Details
          ============================================ */}
      <p className="text-[var(--color-foreground-secondary)] mt-3">
        <span className="font-medium text-[var(--color-foreground)]">Try:</span>{" "}
        {recommendation.dishes.join(", ")}
      </p>

      {recommendation.notes && (
        <p className="text-[var(--color-foreground-muted)] text-sm mt-2 italic">
          "{recommendation.notes}"
        </p>
      )}

      {recommendation.videoUrl && (
        <a
          href={recommendation.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link text-sm mt-3 inline-block"
        >
          View video →
        </a>
      )}

      {/* ============================================
          Action Buttons
          ============================================ */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex gap-4">
        <Link
          href={`/dashboard/edit/${recommendation.id}`}
          className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80"
        >
          Edit
        </Link>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm font-medium text-[var(--color-error)] hover:opacity-80"
          >
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-foreground-muted)]">
              Are you sure?
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm font-medium text-[var(--color-error)] hover:opacity-80 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

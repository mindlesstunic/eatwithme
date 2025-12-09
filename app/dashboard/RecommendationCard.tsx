/**
 * Recommendation Card Component
 *
 * Displays a single recommendation with edit/delete actions.
 * Handles delete confirmation and API calls.
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

  // ============================================
  // Handle delete with confirmation
  // ============================================
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
      // Refresh the page to show updated list
      router.refresh();
    } else {
      alert("Failed to delete recommendation");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg">
      {/* ============================================
          Place Info
          ============================================ */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/place/${recommendation.place.id}`}
            className="font-semibold hover:underline"
          >
            {recommendation.place.name}
          </Link>
          <p className="text-gray-500 text-sm">
            {recommendation.place.address}
          </p>
        </div>

        {/* Sponsored Badge */}
        {recommendation.isSponsored && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Sponsored
          </span>
        )}
      </div>

      {/* ============================================
          Recommendation Details
          ============================================ */}
      <p className="text-gray-600 mt-2">
        Dishes: {recommendation.dishes.join(", ")}
      </p>

      {recommendation.notes && (
        <p className="text-gray-500 text-sm mt-1 italic">
          "{recommendation.notes}"
        </p>
      )}

      {recommendation.videoUrl && (
        <a
          href={recommendation.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
        >
          View video →
        </a>
      )}

      {/* ============================================
          Action Buttons
          ============================================ */}
      <div className="mt-4 pt-4 border-t flex gap-4">
        <Link
          href={`/dashboard/edit/${recommendation.id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          Edit
        </Link>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        ) : (
          /* Delete Confirmation */
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Are you sure?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm text-red-600 hover:underline disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

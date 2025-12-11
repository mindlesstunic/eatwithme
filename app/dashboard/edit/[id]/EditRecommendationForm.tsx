/**
 * Edit Recommendation Form Component
 *
 * Client component that handles the edit form state and submission.
 * Pre-fills with existing data and validates before saving.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  recommendation: {
    id: string;
    dishes: string[];
    videoUrl: string | null;
    hasOffer: boolean;
    offerDetails: string | null;
    offerExpiry: Date | null;
    notes: string | null;
    place: {
      name: string;
      address: string;
    };
  };
};

export default function EditRecommendationForm({ recommendation }: Props) {
  const router = useRouter();

  // ============================================
  // Form state - pre-filled with existing data
  // ============================================
  const [dishes, setDishes] = useState(recommendation.dishes.join(", "));
  const [videoUrl, setVideoUrl] = useState(recommendation.videoUrl || "");
  const [hasOffer, setHasOffer] = useState(recommendation.hasOffer);
  const [offerDetails, setOfferDetails] = useState(
    recommendation.offerDetails || ""
  );
  const [offerExpiry, setOfferExpiry] = useState(
    recommendation.offerExpiry
      ? new Date(recommendation.offerExpiry).toISOString().split("T")[0]
      : ""
  );
  const [notes, setNotes] = useState(recommendation.notes || "");
  // ============================================
  // UI state
  // ============================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // Handle form submission
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/recommendation/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recommendationId: recommendation.id,
        dishes: dishes
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
        videoUrl: videoUrl || null,
        hasOffer,
        offerDetails: hasOffer ? offerDetails || null : null,
        offerExpiry: hasOffer ? offerExpiry || null : null,
        notes: notes || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // Success - go back to dashboard
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ============================================
          Place Info (Read-only)
          ============================================ */}
      <div className="p-4 bg-[var(--color-background-secondary)] rounded-lg">
        <p className="font-medium">{recommendation.place.name}</p>
        <p className="text-sm text-[var(--color-foreground-secondary)]">
          {recommendation.place.address}
        </p>
      </div>

      {/* ============================================
          Dishes Field
          ============================================ */}
      <div>
        <label className="block text-sm font-medium mb-1">
          What to order *
        </label>
        <input
          type="text"
          value={dishes}
          onChange={(e) => setDishes(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="Butter Chicken, Garlic Naan, Mango Lassi"
          required
        />
        <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
          Separate multiple dishes with commas
        </p>
      </div>

      {/* ============================================
          Video URL Field
          ============================================ */}
      <div>
        <label className="block text-sm font-medium mb-1">Video Link</label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="https://instagram.com/reel/..."
        />
      </div>

      {/* ============================================
          Notes Field
          ============================================ */}
      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="Best visited on weekends, try the lunch special..."
          rows={3}
        />
      </div>

      {/* ============================================
          Sponsored Checkbox
          ============================================ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasOffer"
            checked={hasOffer}
            onChange={(e) => setHasOffer(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-primary)]"
          />
          <label htmlFor="hasOffer" className="text-sm">
            This place has a special offer
          </label>
        </div>

        {hasOffer && (
          <div className="ml-6 space-y-3 p-4 bg-[var(--color-background-secondary)] rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">
                Offer Details *
              </label>
              <input
                type="text"
                value={offerDetails}
                onChange={(e) => setOfferDetails(e.target.value)}
                className="input"
                placeholder="e.g., 20% off on weekdays, Free dessert with meal"
                required={hasOffer}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Offer Expiry Date
              </label>
              <input
                type="date"
                value={offerExpiry}
                onChange={(e) => setOfferExpiry(e.target.value)}
                className="input"
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
                Leave empty if no expiry
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================
          Error Message
          ============================================ */}
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

      {/* ============================================
          Action Buttons
          ============================================ */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 p-3 btn-primary rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 border rounded-lg font-medium hover:bg-[var(--color-background-secondary)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

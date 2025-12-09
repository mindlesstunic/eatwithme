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
    isSponsored: boolean;
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
  const [isSponsored, setIsSponsored] = useState(recommendation.isSponsored);
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
        isSponsored,
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
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="font-medium">{recommendation.place.name}</p>
        <p className="text-sm text-gray-500">{recommendation.place.address}</p>
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
        <p className="text-xs text-gray-400 mt-1">
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
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="sponsored"
          checked={isSponsored}
          onChange={(e) => setIsSponsored(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="sponsored" className="text-sm">
          This is a sponsored recommendation
        </label>
      </div>

      {/* ============================================
          Error Message
          ============================================ */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* ============================================
          Action Buttons
          ============================================ */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 p-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/**
 * Place Detail View Component
 *
 * Shows all recommendations for a specific place.
 * Styled with design system, includes back navigation.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { track } from "@/lib/track";
import EmptyState from "@/components/EmptyState";

type Recommendation = {
  id: string;
  dishes: string[];
  videoUrl: string | null;
  hasOffer: boolean;
  offerDetails: string | null;
  offerExpiry: Date | null;
  notes: string | null;
  influencer: {
    id: string;
    username: string;
    displayName: string;
  };
};

type Place = {
  id: string;
  name: string;
  address: string;
  city: string;
  category: string;
  latitude: number;
  longitude: number;
  locationNotes: string | null;
  recommendations: Recommendation[];
};

type Props = {
  place: Place;
};

const categoryLabels: Record<string, string> = {
  street_food: "Street Food",
  casual: "Casual",
  restaurant: "Restaurant",
};

export default function PlaceDetailView({ place }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUsername = searchParams.get("from");

  // Sort recommendations - prioritize the "from" influencer
  const sortedRecommendations = [...place.recommendations].sort((a, b) => {
    if (fromUsername) {
      if (a.influencer.username === fromUsername) return -1;
      if (b.influencer.username === fromUsername) return 1;
    }
    return 0;
  });

  // Split into featured (from influencer) and others
  const featuredRec = fromUsername
    ? sortedRecommendations.find(
        (rec) => rec.influencer.username === fromUsername
      )
    : null;
  const otherRecs = fromUsername
    ? sortedRecommendations.filter(
        (rec) => rec.influencer.username !== fromUsername
      )
    : sortedRecommendations;

  const handleDirectionClick = () => {
    track({
      type: "direction_click",
      placeId: place.id,
    });
  };

  const handleVideoClick = (rec: Recommendation) => {
    track({
      type: "video_click",
      placeId: place.id,
      influencerId: rec.influencer.id,
      recommendationId: rec.id,
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] mb-6 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Place Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-3xl font-bold">{place.name}</h1>
          <span className="text-sm bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] px-3 py-1 rounded-[var(--radius-sm)]">
            {categoryLabels[place.category] || place.category}
          </span>
        </div>
        <p className="text-[var(--color-foreground-secondary)]">
          {place.address}
        </p>
        <p className="text-[var(--color-foreground-muted)] text-sm">
          {place.city}
        </p>
        {place.locationNotes && (
          <p className="text-[var(--color-foreground-secondary)] text-sm mt-2 italic">
            📍 {place.locationNotes}
          </p>
        )}
      </div>

      {/* Get Directions Button */}

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDirectionClick}
        className="btn-primary inline-block mb-8"
      >
        Get Directions →
      </a>

      {/* Featured recommendation from the influencer user came from */}
      {featuredRec && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            From @{featuredRec.influencer.username}
          </h2>

          <div className="card mb-6 border-[var(--color-primary)] border-2">
            <div className="flex items-start justify-between mb-3">
              <a
                href={`/@${featuredRec.influencer.username}`}
                className="group"
              >
                <p className="font-semibold group-hover:text-[var(--color-primary)] transition-colors">
                  {featuredRec.influencer.displayName}
                </p>
                <p className="text-sm text-[var(--color-foreground-muted)]">
                  @{featuredRec.influencer.username}
                </p>
              </a>
              {featuredRec.hasOffer && (
                <span className="badge-offer">🎁 Offer</span>
              )}
            </div>

            <p className="text-[var(--color-foreground-secondary)]">
              <span className="font-medium text-[var(--color-foreground)]">
                Try:
              </span>{" "}
              {featuredRec.dishes.join(", ")}
            </p>

            {featuredRec.notes && (
              <p className="text-[var(--color-foreground-muted)] text-sm mt-2 italic">
                "{featuredRec.notes}"
              </p>
            )}

            {featuredRec.hasOffer && featuredRec.offerDetails && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <span className="font-medium">🎁 Offer:</span>{" "}
                  {featuredRec.offerDetails}
                </p>
                {featuredRec.offerExpiry && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Expires:{" "}
                    {new Date(featuredRec.offerExpiry).toLocaleDateString(
                      "en-GB"
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <a
                href={`/@${featuredRec.influencer.username}`}
                className="flex-1 btn-secondary text-sm text-center py-2"
              >
                Profile
              </a>
              {featuredRec.videoUrl && (
                <a
                  href={featuredRec.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleVideoClick(featuredRec)}
                  className="flex-1 btn-primary text-sm text-center py-2"
                >
                  Video
                </a>
              )}
            </div>
          </div>
        </>
      )}

      {/* Other recommendations */}
      {otherRecs.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold mb-4">
            {featuredRec
              ? `Also recommended by ${otherRecs.length} other${
                  otherRecs.length !== 1 ? "s" : ""
                }`
              : `${otherRecs.length} Recommendation${
                  otherRecs.length !== 1 ? "s" : ""
                }`}
          </h2>

          <div className="space-y-4">
            {otherRecs.map((rec) => (
              <div key={rec.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <a href={`/@${rec.influencer.username}`} className="group">
                    <p className="font-semibold group-hover:text-[var(--color-primary)] transition-colors">
                      {rec.influencer.displayName}
                    </p>
                    <p className="text-sm text-[var(--color-foreground-muted)]">
                      @{rec.influencer.username}
                    </p>
                  </a>
                  {rec.hasOffer && (
                    <span className="badge-offer">🎁 Offer</span>
                  )}
                </div>

                <p className="text-[var(--color-foreground-secondary)]">
                  <span className="font-medium text-[var(--color-foreground)]">
                    Try:
                  </span>{" "}
                  {rec.dishes.join(", ")}
                </p>

                {rec.notes && (
                  <p className="text-[var(--color-foreground-muted)] text-sm mt-2 italic">
                    "{rec.notes}"
                  </p>
                )}

                {rec.hasOffer && rec.offerDetails && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <span className="font-medium">🎁 Offer:</span>{" "}
                      {rec.offerDetails}
                    </p>
                    {rec.offerExpiry && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Expires:{" "}
                        {new Date(rec.offerExpiry).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <a
                    href={`/@${rec.influencer.username}`}
                    className="flex-1 btn-secondary text-sm text-center py-2"
                  >
                    Profile
                  </a>
                  {rec.videoUrl && (
                    <a
                      href={rec.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleVideoClick(rec)}
                      className="flex-1 btn-primary text-sm text-center py-2"
                    >
                      Video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        !featuredRec && (
          <EmptyState
            icon="🍜"
            title="No recommendations yet"
            description="This place hasn't been recommended by any influencers yet."
          />
        )
      )}
    </div>
  );
}

/**
 * Place Cards Component
 *
 * Horizontal swipeable cards that overlay the bottom of the map.
 * Syncs with map markers - tapping a marker scrolls to its card.
 */

"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

type Recommendation = {
  id: string;
  dishes: string[];
  videoUrl?: string | null;
  isSponsored: boolean;
  influencer: {
    displayName: string;
    username: string;
  };
};

type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  recommendations?: Recommendation[];
};

type Props = {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceSelect: (placeId: string) => void;
};

export default function PlaceCards({
  places,
  selectedPlaceId,
  onPlaceSelect,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // ============================================
  // Scroll to selected card when marker is tapped
  // ============================================
  useEffect(() => {
    if (selectedPlaceId && scrollContainerRef.current) {
      const cardElement = cardRefs.current.get(selectedPlaceId);
      if (cardElement) {
        cardElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedPlaceId]);

  // ============================================
  // Track direction clicks
  // ============================================
  const handleDirectionClick = (place: Place) => {
    track({
      type: "direction_click",
      placeId: place.id,
    });
  };

  // ============================================
  // Track video clicks
  // ============================================
  const handleVideoClick = (rec: Recommendation, placeId: string) => {
    track({
      type: "video_click",
      placeId,
      recommendationId: rec.id,
    });
  };

  if (places.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* ============================================
          Gradient fade at top
          ============================================ */}
      <div className="h-8 bg-gradient-to-t from-[var(--color-background)] to-transparent" />

      {/* ============================================
          Scrollable card container
          ============================================ */}
      <div className="bg-[var(--color-background)] pb-4">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide"
        >
          {places.map((place) => {
            const isSelected = place.id === selectedPlaceId;

            return (
              <div
                key={place.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(place.id, el);
                }}
                onClick={() => onPlaceSelect(place.id)}
                className={`
                  flex-shrink-0 w-[280px] sm:w-[320px] p-4 rounded-[var(--radius-lg)] 
                  snap-center cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? "bg-[var(--color-primary-light)] border-2 border-[var(--color-primary)]"
                      : "bg-[var(--color-background)] border border-[var(--color-border)] hover:border-[var(--color-primary)]"
                  }
                `}
              >
                {/* ============================================
                    Place Header
                    ============================================ */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base truncate">
                      {place.name}
                    </h3>
                    <p className="text-sm text-[var(--color-foreground-secondary)] truncate">
                      {place.address}
                    </p>
                  </div>
                </div>

                {/* ============================================
                    Recommendations Preview
                    ============================================ */}
                {place.recommendations && place.recommendations.length > 0 && (
                  <div className="mb-3">
                    {place.recommendations.slice(0, 2).map((rec) => (
                      <div key={rec.id} className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            @{rec.influencer.username}
                          </span>
                          {rec.isSponsored && (
                            <span className="badge-sponsored text-xs">
                              Sponsored
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-foreground-secondary)] line-clamp-1">
                          Try: {rec.dishes.join(", ")}
                        </p>
                        {rec.videoUrl && (
                          <a
                            href={rec.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVideoClick(rec, place.id);
                            }}
                            className="text-xs text-[var(--color-primary)] hover:opacity-80 mt-1 inline-block"
                          >
                            Watch video →
                          </a>
                        )}
                      </div>
                    ))}
                    {place.recommendations.length > 2 && (
                      <p className="text-xs text-[var(--color-foreground-muted)] mt-2">
                        +{place.recommendations.length - 2} more recommendation
                        {place.recommendations.length - 2 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}

                {/* ============================================
                    Actions
                    ============================================ */}
                <div className="flex gap-2 mt-auto">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectionClick(place);
                    }}
                    className="flex-1 btn-primary text-sm text-center py-2"
                  >
                    Directions
                  </a>

                  <a
                    href={`/place/${place.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn-secondary text-sm py-2 px-3"
                  >
                    Details
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

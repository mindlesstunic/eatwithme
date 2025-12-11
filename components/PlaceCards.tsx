/**
 * Place Cards Component
 *
 * Horizontal swipeable cards that overlay the bottom of the map.
 * Two modes:
 * - discovery: Shows place with all unique dishes from all influencers
 * - influencer: Shows place with that influencer's dishes and notes
 */

"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/track";
import { getDistanceKm, formatDistance } from "@/lib/distance";

type Recommendation = {
  id: string;
  dishes: string[];
  videoUrl?: string | null;
  isSponsored: boolean;
  notes?: string | null;
  influencer: {
    displayName: string;
    username: string;
  };
};

type Place = {
  id: string;
  name: string;
  address: string;
  area?: string;
  latitude: number;
  longitude: number;
  recommendations?: Recommendation[];
};

type Props = {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceSelect: (placeId: string) => void;
  mode?: "discovery" | "influencer";
  userLocation?: { lat: number; lng: number } | null;
};

export default function PlaceCards({
  places,
  selectedPlaceId,
  onPlaceSelect,
  mode = "discovery",
  userLocation = null,
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

  if (places.length === 0) return null;

  // ============================================
  // Get unique dishes from all recommendations
  // ============================================
  const getUniqueDishes = (recommendations: Recommendation[] | undefined) => {
    if (!recommendations || recommendations.length === 0) return [];
    const allDishes = recommendations.flatMap((rec) => rec.dishes);
    return [...new Set(allDishes)];
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Gradient fade */}
      <div className="h-8 bg-gradient-to-t from-[var(--color-background)] to-transparent" />

      {/* Scrollable cards */}
      <div className="bg-[var(--color-background)] pb-4">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide"
        >
          {places.map((place) => {
            const isSelected = place.id === selectedPlaceId;
            const firstRec = place.recommendations?.[0];

            // Calculate distance if user location available
            const distance = userLocation
              ? getDistanceKm(
                  userLocation.lat,
                  userLocation.lng,
                  place.latitude,
                  place.longitude
                )
              : null;

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
                  flex flex-col h-[200px]
                  ${
                    isSelected
                      ? "bg-[var(--color-primary-light)] border-2 border-[var(--color-primary)]"
                      : "bg-[var(--color-background)] border border-[var(--color-border)] hover:border-[var(--color-primary)]"
                  }
                `}
              >
                {/* ============================================
                    Place Header - Top
                    ============================================ */}
                <div className="mb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base line-clamp-1">
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {mode === "influencer" && firstRec?.isSponsored && (
                        <span className="badge-sponsored text-xs">
                          Sponsored
                        </span>
                      )}
                      {distance !== null && (
                        <span className="text-xs text-[var(--color-foreground-muted)] whitespace-nowrap">
                          {formatDistance(distance)}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-foreground-secondary)] line-clamp-1">
                    {place.area || place.address}
                  </p>
                </div>

                {/* ============================================
                    Content - Middle (flex-grow to push buttons down)
                    ============================================ */}
                <div className="flex-grow">
                  {mode === "discovery" ? (
                    // Discovery mode: Show unique dishes from all influencers
                    <div>
                      {place.recommendations &&
                        place.recommendations.length > 0 && (
                          <p className="text-sm text-[var(--color-foreground-secondary)] line-clamp-1">
                            <span className="font-medium text-[var(--color-foreground)]">
                              Try:
                            </span>{" "}
                            {getUniqueDishes(place.recommendations).join(", ")}
                          </p>
                        )}
                      {place.recommendations &&
                        place.recommendations.length > 1 && (
                          <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
                            Recommended by {place.recommendations.length}{" "}
                            influencers
                          </p>
                        )}
                    </div>
                  ) : (
                    // Influencer mode: Show that influencer's dishes + notes
                    <div>
                      {firstRec && (
                        <>
                          <p className="text-sm text-[var(--color-foreground-secondary)] line-clamp-1">
                            <span className="font-medium text-[var(--color-foreground)]">
                              Try:
                            </span>{" "}
                            {firstRec.dishes.join(", ")}
                          </p>
                          {firstRec.notes && (
                            <p className="text-xs text-[var(--color-foreground-muted)] mt-1 italic line-clamp-1">
                              "{firstRec.notes}"
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* ============================================
                    Actions - Bottom (always at bottom)
                    ============================================ */}
                <div className="flex gap-2 mt-3">
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

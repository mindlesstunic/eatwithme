/**
 * Place Cards Component
 *
 * Horizontal swipeable cards that overlay the bottom of the map.
 * Two modes:
 * - discovery: Shows place with all unique dishes from all influencers
 * - influencer: Shows place with that influencer's dishes and notes
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";
import { getDistanceKm, formatDistance } from "@/lib/distance";

type Recommendation = {
  id: string;
  dishes: string[];
  videoUrl?: string | null;
  hasOffer: boolean;
  offerDetails?: string | null;
  offerExpiry?: Date | null;
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
  influencer?: {
    displayName: string;
    username: string;
    instagram?: string | null;
    youtube?: string | null;
    profileImage?: string | null;
  };
};

// ============================================
// Influencer Banner (shows above cards in influencer mode)
// ============================================
function InfluencerBanner({
  influencer,
  placeCount,
}: {
  placeCount: number;
  influencer: {
    displayName: string;
    username: string;
    instagram?: string | null;
    youtube?: string | null;
    profileImage?: string | null;
  };
}) {
  return (
    <div className="mx-4 mb-2 px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--color-background)]/95 backdrop-blur-sm border border-[var(--color-border)] shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-3">
          {influencer.profileImage ? (
            <img
              src={influencer.profileImage}
              alt={influencer.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold text-lg">
              {influencer.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-sm leading-tight">
              {influencer.displayName}'s Map
            </h2>
            <p className="text-xs text-[var(--color-foreground-muted)]">
              @{influencer.username} · {placeCount} place
              {placeCount !== 1 && "s"}
            </p>
          </div>
        </div>

        {/* Right: Social Links */}
        <div className="flex items-center gap-2">
          {influencer.instagram && (
            <a
              href={`https://instagram.com/${influencer.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-[var(--color-background-secondary)] transition-colors"
              aria-label="Instagram"
            >
              <svg
                className="w-5 h-5 text-[var(--color-foreground-secondary)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {influencer.youtube && (
            <a
              href={influencer.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-[var(--color-background-secondary)] transition-colors"
              aria-label="YouTube"
            >
              <svg
                className="w-5 h-5 text-[var(--color-foreground-secondary)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlaceCards({
  places,
  selectedPlaceId,
  onPlaceSelect,
  mode = "discovery",
  userLocation = null,
  influencer,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [isReady, setIsReady] = useState(false);

  // Sort places by distance if user location available
  const sortedPlaces = userLocation
    ? [...places].sort((a, b) => {
        const distA = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          a.latitude,
          a.longitude
        );
        const distB = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      })
    : places;

  // Wait for location before showing cards
  useEffect(() => {
    if (userLocation) {
      setIsReady(true);
      return;
    }
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, [userLocation]);

  // Select first card once ready
  useEffect(() => {
    if (isReady && sortedPlaces.length > 0) {
      onPlaceSelect(sortedPlaces[0].id);
    }
  }, [isReady]);

  // Scroll to selected card when marker is tapped
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

  // Auto-select card when scroll stops
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || sortedPlaces.length === 0) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScrollEnd = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestPlace: string | null = null;
      let closestDistance = Infinity;

      cardRefs.current.forEach((card, placeId) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPlace = placeId;
        }
      });

      if (closestPlace && closestPlace !== selectedPlaceId) {
        onPlaceSelect(closestPlace);
      }
    };

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [sortedPlaces, selectedPlaceId, onPlaceSelect]);

  // ============================================
  // Helper functions
  // ============================================
  const handleDirectionClick = (place: Place) => {
    track({
      type: "direction_click",
      placeId: place.id,
    });
  };

  const getUniqueDishes = (recommendations: Recommendation[] | undefined) => {
    if (!recommendations || recommendations.length === 0) return [];
    const allDishes = recommendations.flatMap((rec) => rec.dishes);
    return [...new Set(allDishes)];
  };

  // ============================================
  // Early returns AFTER all hooks
  // ============================================
  if (places.length === 0) return null;

  if (!isReady) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="h-8 bg-gradient-to-t from-[var(--color-background)] to-transparent" />
        <div className="bg-[var(--color-background)] pb-4 px-4 h-[200px]" />
      </div>
    );
  }

  // ============================================
  // Main return
  // ============================================
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Gradient fade */}
      <div className="h-8 bg-gradient-to-t from-[var(--color-background)] to-transparent" />

      {/* Bottom section with solid background */}
      <div className="bg-[var(--color-background)] pb-4">
        {/* Influencer Banner - only in influencer mode */}
        {influencer && (
          <div className="pt-1">
            <InfluencerBanner
              influencer={influencer}
              placeCount={sortedPlaces.length}
            />
          </div>
        )}

        {/* Scrollable cards */}

        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide"
        >
          {sortedPlaces.map((place) => {
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
                data-place-id={place.id}
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
                      {mode === "influencer" && firstRec?.hasOffer && (
                        <span className="badge-offer text-xs">🎁 Offer</span>
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
                      {place.recommendations?.some(
                        (rec) =>
                          rec.hasOffer &&
                          (!rec.offerExpiry ||
                            new Date(rec.offerExpiry) > new Date())
                      ) && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          🎁 Offer available
                        </p>
                      )}
                    </div>
                  ) : (
                    // Influencer mode: Show that influencer's dishes + notes + offer
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
                          {firstRec.hasOffer && firstRec.offerDetails && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1 line-clamp-1">
                              🎁 {firstRec.offerDetails}
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
                    href={`/place/${place.id}${
                      influencer ? `?from=${influencer.username}` : ""
                    }`}
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

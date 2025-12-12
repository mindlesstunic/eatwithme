/**
 * Influencer View Component
 *
 * Full-page map view of an influencer's recommendations.
 * Cards show that influencer's dishes and notes only.
 */

"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";
import ViewToggle from "@/components/ViewToggle";
import EmptyState from "@/components/EmptyState";
import { getDistanceKm, formatDistance } from "@/lib/distance";
import { track } from "@/lib/track";

type Recommendation = {
  id: string;
  dishes: string[];
  videoUrl: string | null;
  hasOffer: boolean;
  offerDetails?: string | null;
  offerExpiry?: Date | null;
  notes?: string | null;
  influencer: {
    displayName: string;
    username: string;
  };
  place: {
    id: string;
    name: string;
    address: string;
    area?: string;
    latitude: number;
    longitude: number;
  };
};

type Props = {
  recommendations: Recommendation[];
  influencer: {
    id: string;
    displayName: string;
    username: string;
    bio?: string | null;
    instagram?: string | null;
    youtube?: string | null;
  };
};

function LocationBanner({
  onEnable,
  onDismiss,
}: {
  onEnable: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="mx-4 mb-2 px-4 py-3 rounded-[var(--radius-lg)] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">📍</span>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Enable location to sort by distance
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEnable}
            className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-[var(--radius-md)] hover:bg-blue-700 transition-colors"
          >
            Enable
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-[var(--radius-md)] transition-colors"
            aria-label="Dismiss"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InfluencerView({ recommendations, influencer }: Props) {
  const [view, setView] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error:", error.message);
          setLocationDenied(true);
        }
      );
    } else {
      setLocationDenied(true);
    }
  }, []);

  const handleViewChange = (newView: "map" | "list") => {
    setView(newView);
    track({
      type: newView === "map" ? "map_view" : "list_view",
      influencerId: influencer.id,
    });
  };

  const handleDirectionClick = (rec: Recommendation) => {
    track({
      type: "direction_click",
      placeId: rec.place.id,
      influencerId: influencer.id,
      recommendationId: rec.id,
    });
  };

  const handleVideoClick = (rec: Recommendation) => {
    track({
      type: "video_click",
      placeId: rec.place.id,
      influencerId: influencer.id,
      recommendationId: rec.id,
    });
  };

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationDenied(false);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
          alert(
            "Unable to get location. Please enable it in your browser settings."
          );
        }
      );
    }
  };

  const sortedRecommendations = userLocation
    ? [...recommendations].sort((a, b) => {
        const distA = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          a.place.latitude,
          a.place.longitude
        );
        const distB = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          b.place.latitude,
          b.place.longitude
        );
        return distA - distB;
      })
    : [...recommendations].sort((a, b) => {
        // Fallback: offers first, then alphabetically
        if (a.hasOffer && !b.hasOffer) return -1;
        if (!a.hasOffer && b.hasOffer) return 1;
        return a.place.name.localeCompare(b.place.name);
      });

  // Transform recommendations to places format for Map component
  // Include notes for influencer mode
  const places = sortedRecommendations.map((rec) => ({
    id: rec.place.id,
    name: rec.place.name,
    address: rec.place.address,
    area: rec.place.area,
    latitude: rec.place.latitude,
    longitude: rec.place.longitude,
    recommendations: [
      {
        id: rec.id,
        dishes: rec.dishes,
        videoUrl: rec.videoUrl,
        hasOffer: rec.hasOffer,
        offerDetails: rec.offerDetails,
        offerExpiry: rec.offerExpiry,
        notes: rec.notes,
        influencer: {
          displayName: influencer.displayName,
          username: influencer.username,
        },
      },
    ],
  }));

  // ============================================
  // Empty State
  // ============================================
  if (recommendations.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          icon="🍜"
          title="No recommendations yet"
          description={`${influencer.displayName} hasn't added any food recommendations yet. Check back soon!`}
        />
      </div>
    );
  }

  // ============================================
  // Map View - Full Page, No Floating Info
  // ============================================
  if (view === "map") {
    return (
      <div className="relative h-[calc(100dvh-73px)] overflow-hidden">
        {/* Floating Toggle - Top Right */}
        <div className="absolute top-4 right-4 z-30">
          <ViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {/* Full Page Map */}
        <Map
          places={places}
          fullHeight={true}
          center={userLocation || undefined}
          mode="influencer"
          userLocation={userLocation}
          influencer={influencer}
        />

        {/* Location Banner - Above Cards */}
        {locationDenied && !bannerDismissed && !userLocation && (
          <div className="absolute bottom-[500px] left-0 right-0 z-30 px-4">
            <LocationBanner
              onEnable={handleEnableLocation}
              onDismiss={() => setBannerDismissed(true)}
            />
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // List View - Shows Influencer Info
  // ============================================
  return (
    <div className="relative min-h-[calc(100dvh-73px)]">
      {/* Sticky Banner */}
      <div className="sticky top-[73px] z-40 bg-[var(--color-background)] border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Avatar + Name */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                {influencer.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm leading-tight truncate">
                  {influencer.displayName}&apos;s Map
                </h2>
                <p className="text-xs text-[var(--color-foreground-muted)]">
                  @{influencer.username}
                </p>
                <p className="text-xs text-[var(--color-foreground-muted)]">
                  {recommendations.length} place
                  {recommendations.length !== 1 && "s"}
                </p>
              </div>
            </div>

            {/* Right: Social Links + Toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
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
              <ViewToggle view={view} onViewChange={handleViewChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Location Banner */}
      {locationDenied && !bannerDismissed && !userLocation && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <LocationBanner
            onEnable={handleEnableLocation}
            onDismiss={() => setBannerDismissed(true)}
          />
        </div>
      )}

      {/* List Content */}
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="space-y-4">
          {sortedRecommendations.map((rec) => {
            const distance = userLocation
              ? getDistanceKm(
                  userLocation.lat,
                  userLocation.lng,
                  rec.place.latitude,
                  rec.place.longitude
                )
              : null;

            return (
              <div key={rec.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/place/${rec.place.id}?from=${influencer.username}`}
                      className="text-lg font-semibold hover:text-[var(--color-primary)] transition-colors block truncate"
                    >
                      {rec.place.name}
                    </a>
                    <p className="text-[var(--color-foreground-secondary)] text-sm">
                      {rec.place.area || rec.place.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {rec.hasOffer && (
                      <span className="badge-offer">🎁 Offer</span>
                    )}
                    {distance !== null && (
                      <span className="text-sm text-[var(--color-foreground-muted)] whitespace-nowrap">
                        {formatDistance(distance)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[var(--color-foreground-secondary)] mt-3">
                  <span className="font-medium text-[var(--color-foreground)]">
                    Try:
                  </span>{" "}
                  {rec.dishes.join(", ")}
                </p>

                {rec.notes && (
                  <p className="text-[var(--color-foreground-muted)] text-sm mt-2 italic">
                    &quot;{rec.notes}&quot;
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
                    href={`https://www.google.com/maps/dir/?api=1&destination=${rec.place.latitude},${rec.place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleDirectionClick(rec)}
                    className="flex-1 btn-primary text-sm text-center py-2"
                  >
                    Directions
                  </a>

                  {rec.videoUrl ? (
                    <>
                      <a
                        href={rec.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleVideoClick(rec)}
                        className="flex-1 btn-primary text-sm text-center py-2"
                      >
                        Video
                      </a>

                      <a
                        href={`/place/${rec.place.id}?from=${influencer.username}`}
                        className="px-3 py-2 btn-secondary text-sm"
                        aria-label="Details"
                      >
                        →
                      </a>
                    </>
                  ) : (
                    <a
                      href={`/place/${rec.place.id}?from=${influencer.username}`}
                      className="flex-1 btn-secondary text-sm text-center py-2"
                    >
                      Details
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

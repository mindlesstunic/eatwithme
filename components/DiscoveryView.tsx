/**
 * Discovery View Component
 *
 * Full-page map view for discovery.
 * Cards show aggregated dishes from all influencers.
 */

"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";
import ViewToggle from "@/components/ViewToggle";
import EmptyState from "@/components/EmptyState";
import { getDistanceKm, formatDistance } from "@/lib/distance";
import { track } from "@/lib/track";
import { usePageView } from "@/hooks/usePageView";
type Place = {
  id: string;
  name: string;
  address: string;
  area?: string;
  city: string;
  latitude: number;
  longitude: number;
  recommendations: {
    id: string;
    dishes: string[];
    videoUrl: string | null;
    hasOffer: boolean;
    offerDetails: string | null;
    offerExpiry: Date | null;
    influencer: {
      displayName: string;
      username: string;
    };
  }[];
};

type Props = {
  places: Place[];
};

function LocationBanner({
  onEnable,
  onDismiss,
}: {
  onEnable: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="mx-4 px-4 py-3 rounded-[var(--radius-lg)] bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
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

export default function DiscoveryView({ places }: Props) {
  const [view, setView] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  usePageView();

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
    });
  };

  const handleDirectionClick = (place: Place) => {
    track({
      type: "direction_click",
      placeId: place.id,
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
    : [...places].sort((a, b) => {
        // Fallback: places with offers first, then alphabetically
        const aHasOffer = a.recommendations.some((r) => r.hasOffer);
        const bHasOffer = b.recommendations.some((r) => r.hasOffer);
        if (aHasOffer && !bHasOffer) return -1;
        if (!aHasOffer && bHasOffer) return 1;
        return a.name.localeCompare(b.name);
      });

  // Get unique dishes for a place
  const getUniqueDishes = (place: Place) => {
    const allDishes = place.recommendations.flatMap((rec) => rec.dishes);
    return [...new Set(allDishes)];
  };

  // ============================================
  // Empty State
  // ============================================
  if (places.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          icon="🍽️"
          title="No places yet"
          description="Be the first to add food recommendations! Are you an influencer?"
          actionLabel="Join as Influencer"
          actionHref="/login"
        />
      </div>
    );
  }

  // ============================================
  // Map View
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
          places={sortedPlaces}
          fullHeight={true}
          center={userLocation || undefined}
          mode="discovery"
          userLocation={userLocation}
        />

        {/* Location Banner */}
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
  // List View
  // ============================================
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-[var(--color-foreground-secondary)]">
            {places.length} place{places.length !== 1 && "s"}
          </p>
        </div>
        <ViewToggle view={view} onViewChange={handleViewChange} />
      </div>

      {/* Location Banner */}
      {locationDenied && !bannerDismissed && !userLocation && (
        <div className="mb-4">
          <LocationBanner
            onEnable={handleEnableLocation}
            onDismiss={() => setBannerDismissed(true)}
          />
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {sortedPlaces.map((place) => {
          const distance = userLocation
            ? getDistanceKm(
                userLocation.lat,
                userLocation.lng,
                place.latitude,
                place.longitude
              )
            : null;

          return (
            <div key={place.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <a
                    href={`/place/${place.id}`}
                    className="text-lg font-semibold hover:text-[var(--color-primary)] transition-colors"
                  >
                    {place.name}
                  </a>
                  <p className="text-[var(--color-foreground-secondary)] text-sm">
                    {place.area || place.address}
                  </p>
                </div>
                {distance !== null && (
                  <span className="text-sm text-[var(--color-foreground-muted)] whitespace-nowrap ml-4">
                    {formatDistance(distance)}
                  </span>
                )}
              </div>

              <p className="text-[var(--color-foreground-secondary)] mt-3">
                <span className="font-medium text-[var(--color-foreground)]">
                  Try:
                </span>{" "}
                {getUniqueDishes(place).join(", ")}
              </p>

              {place.recommendations.length > 1 && (
                <p className="text-xs text-[var(--color-foreground-muted)] mt-2">
                  Recommended by {place.recommendations.length} influencers
                </p>
              )}

              {place.recommendations.some(
                (rec) =>
                  rec.hasOffer &&
                  (!rec.offerExpiry || new Date(rec.offerExpiry) > new Date())
              ) && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  🎁 Offer available
                </p>
              )}
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleDirectionClick(place)}
                  className="flex-1 btn-primary text-sm text-center py-2"
                >
                  Directions
                </a>

                <a
                  href={`/place/${place.id}`}
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
  );
}

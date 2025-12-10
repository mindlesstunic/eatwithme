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
  city: string;
  latitude: number;
  longitude: number;
  recommendations: {
    id: string;
    dishes: string[];
    videoUrl: string | null;
    isSponsored: boolean;
    influencer: {
      displayName: string;
      username: string;
    };
  }[];
};

type Props = {
  places: Place[];
};

export default function DiscoveryView({ places }: Props) {
  const [view, setView] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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
        }
      );
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
      <div className="relative h-[calc(100vh-73px)] overflow-hidden">
        {/* Floating Toggle - Top Right */}
        <div className="absolute top-4 right-4 z-30">
          <ViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {/* Full Page Map */}
        <Map
          places={places}
          fullHeight={true}
          center={userLocation || undefined}
          mode="discovery"
        />
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
                    {place.address}
                  </p>
                </div>
                {distance !== null && (
                  <span className="text-sm text-[var(--color-foreground-muted)] whitespace-nowrap ml-4">
                    {formatDistance(distance)}
                  </span>
                )}
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleDirectionClick(place)}
                className="link text-sm inline-block mt-2"
              >
                Get directions →
              </a>

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
            </div>
          );
        })}
      </div>
    </div>
  );
}

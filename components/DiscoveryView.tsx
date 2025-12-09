/**
 * Discovery View Component
 * 
 * Full-page map view for discovery with toggle to list.
 * Map takes full viewport for immersive browsing.
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
  // Map View - Full Page
  // ============================================
  if (view === "map") {
    return (
      <div className="relative">
        {/* Floating Toggle */}
        <div className="absolute top-4 right-4 z-30">
          <ViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {/* Floating Title */}
        <div className="absolute top-4 left-4 z-30 bg-[var(--color-background)]/90 backdrop-blur-sm px-4 py-2 rounded-[var(--radius-lg)] shadow-md">
          <h1 className="text-lg font-bold">Discover</h1>
          <p className="text-sm text-[var(--color-foreground-secondary)]">
            {places.length} place{places.length !== 1 && "s"}
          </p>
        </div>

        {/* Full Page Map */}
        <Map 
          places={places} 
          fullHeight={true}
          center={userLocation || undefined}
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
                  
                   <a href={`/place/${place.id}`}
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

              
               <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleDirectionClick(place)}
                className="link text-sm inline-block mt-2"
              >
                Get directions →
              </a>

              <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-foreground-secondary)]">
                  Recommended by {place.recommendations.length} influencer
                  {place.recommendations.length !== 1 && "s"}
                </p>
                {place.recommendations.map((rec) => (
                  <div key={rec.id} className="mt-2 text-sm">
                    <span className="font-medium">@{rec.influencer.username}</span>
                    <span className="text-[var(--color-foreground-secondary)]">
                      {" "}— {rec.dishes.join(", ")}
                    </span>
                    {rec.isSponsored && (
                      <span className="badge-sponsored ml-2">Sponsored</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
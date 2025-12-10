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
  isSponsored: boolean;
  notes?: string | null;
  influencer: {
    displayName: string;
    username: string;
  };
  place: {
    id: string;
    name: string;
    address: string;
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

export default function InfluencerView({ recommendations, influencer }: Props) {
  const [view, setView] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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
    : recommendations;

  // Transform recommendations to places format for Map component
  // Include notes for influencer mode
  const places = recommendations.map((rec) => ({
    id: rec.place.id,
    name: rec.place.name,
    address: rec.place.address,
    latitude: rec.place.latitude,
    longitude: rec.place.longitude,
    recommendations: [
      {
        id: rec.id,
        dishes: rec.dishes,
        videoUrl: rec.videoUrl,
        isSponsored: rec.isSponsored,
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
        />
      </div>
    );
  }

  // ============================================
  // List View - Shows Influencer Info
  // ============================================
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header with Influencer Info */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{influencer.displayName}</h1>
          <p className="text-[var(--color-foreground-secondary)]">
            @{influencer.username}
          </p>
          {influencer.bio && (
            <p className="text-[var(--color-foreground-secondary)] mt-2 max-w-lg">
              {influencer.bio}
            </p>
          )}

          {/* Social Links */}
          {(influencer.instagram || influencer.youtube) && (
            <div className="flex gap-4 mt-3">
              {influencer.instagram && (
                <a
                  href={`https://instagram.com/${influencer.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-primary)] hover:opacity-80 flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>
              )}
              {influencer.youtube && (
                <a
                  href={influencer.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--color-primary)] hover:opacity-80 flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  YouTube
                </a>
              )}
            </div>
          )}

          <p className="text-sm text-[var(--color-foreground-muted)] mt-4">
            {recommendations.length} place{recommendations.length !== 1 && "s"}
          </p>
        </div>
        <ViewToggle view={view} onViewChange={handleViewChange} />
      </div>

      {/* List */}
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
              <div className="flex items-start justify-between">
                <div>
                  <a
                    href={`/place/${rec.place.id}`}
                    className="text-lg font-semibold hover:text-[var(--color-primary)] transition-colors"
                  >
                    {rec.place.name}
                  </a>
                  <p className="text-[var(--color-foreground-secondary)] text-sm">
                    {rec.place.address}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {rec.isSponsored && (
                    <span className="badge-sponsored">Sponsored</span>
                  )}
                  {distance !== null && (
                    <span className="text-sm text-[var(--color-foreground-muted)] whitespace-nowrap">
                      {formatDistance(distance)}
                    </span>
                  )}
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${rec.place.latitude},${rec.place.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleDirectionClick(rec)}
                className="link text-sm inline-block mt-2"
              >
                Get directions →
              </a>

              <p className="text-[var(--color-foreground-secondary)] mt-3">
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

              {rec.videoUrl && (
                <a
                  href={rec.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleVideoClick(rec)}
                  className="link text-sm inline-block mt-2"
                >
                  Watch video →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

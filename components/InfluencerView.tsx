"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";
import ViewToggle from "@/components/ViewToggle";
import { getDistanceKm, formatDistance } from "@/lib/distance";

type Recommendation = {
  id: string;
  dishes: string[];
  videoUrl: string | null;
  isSponsored: boolean;
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
    displayName: string;
    username: string;
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

  // Sort by distance if we have user location
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

  // Group recommendations by place for the map
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
        influencer: {
          displayName: influencer.displayName,
          username: influencer.username,
        },
      },
    ],
  }));

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {recommendations.length} Recommendation
          {recommendations.length !== 1 && "s"}
        </h2>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Map View */}
      {view === "map" && <Map places={places} />}

      {/* List View */}
      {view === "list" && (
        <ul className="space-y-4">
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
              <li key={rec.id} className="border p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <strong className="text-lg">{rec.place.name}</strong>
                    <p className="text-gray-500 text-sm">{rec.place.address}</p>
                  </div>
                  {distance !== null && (
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {formatDistance(distance)}
                    </span>
                  )}
                </div>

                {/* Get Directions */}
                
                <a  href={`https://www.google.com/maps/dir/?api=1&destination=${rec.place.latitude},${rec.place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-block mt-2"
                >
                  Get directions →
                </a>

                <p className="text-gray-600 mt-2">
                  Try: {rec.dishes.join(", ")}
                </p>
                {rec.videoUrl && (
                  
                   <a href={rec.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Watch video →
                  </a>
                )}
                {rec.isSponsored && (
                  <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Sponsored
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
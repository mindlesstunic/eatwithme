"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";
import ViewToggle from "@/components/ViewToggle";
import { getDistanceKm, formatDistance } from "@/lib/distance";

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

  // Sort places by distance if we have user location
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

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {places.length} Place{places.length !== 1 && "s"}
        </h2>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Map View */}
      {view === "map" && <Map places={places} />}

      {/* List View */}
      {view === "list" && (
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
              <div key={place.id} className="border p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{place.name}</h3>
                    <p className="text-gray-500 text-sm">{place.address}</p>
                  </div>
                  {distance !== null && (
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {formatDistance(distance)}
                    </span>
                  )}
                </div>

                {/* Get Directions */}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-block mt-2"
                >
                  Get directions →
                </a>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    Recommended by {place.recommendations.length} influencer
                    {place.recommendations.length !== 1 && "s"}
                  </p>
                  {place.recommendations.map((rec) => (
                    <div key={rec.id} className="mt-2 text-sm">
                      <span className="font-medium">
                        @{rec.influencer.username}
                      </span>
                      <span className="text-gray-500">
                        {" "}
                        — {rec.dishes.join(", ")}
                      </span>
                      {rec.isSponsored && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                          Sponsored
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

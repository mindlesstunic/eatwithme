"use client";

import { useState } from "react";
import Map from "@/components/Map";
import ViewToggle from "@/components/ViewToggle";

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
    influencer: {
      displayName: string;
    };
  }[];
};

type Props = {
  places: Place[];
};

export default function DiscoveryView({ places }: Props) {
  const [view, setView] = useState<"map" | "list">("map");

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
      {view === "map" && (
        <Map
          places={places.map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            latitude: p.latitude,
            longitude: p.longitude,
          }))}
        />
      )}

      {/* List View */}
      {view === "list" && (
        <div className="space-y-4">
          {places.map((place) => (
            <div key={place.id} className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold">{place.name}</h3>
              <p className="text-gray-500 text-sm">{place.address}</p>
              <p className="text-gray-400 text-xs">{place.city}</p>

              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-600">
                  Recommended by {place.recommendations.length} influencer
                  {place.recommendations.length !== 1 && "s"}
                </p>
                {place.recommendations.map((rec) => (
                  <div key={rec.id} className="mt-2 text-sm">
                    <span className="font-medium">
                      {rec.influencer.displayName}
                    </span>
                    <span className="text-gray-500">
                      {" "}
                      — {rec.dishes.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Map from "@/components/Map";
import ViewToggle from "@/components/ViewToggle";

type Recommendation = {
  id: string;
  dishes: string[];
  isSponsored: boolean;
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
};

export default function InfluencerView({ recommendations }: Props) {
  const [view, setView] = useState<"map" | "list">("map");

  const places = recommendations.map((rec) => ({
    id: rec.place.id,
    name: rec.place.name,
    address: rec.place.address,
    latitude: rec.place.latitude,
    longitude: rec.place.longitude,
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
          {recommendations.map((rec) => (
            <li key={rec.id} className="border p-4 rounded-lg">
              <strong className="text-lg">{rec.place.name}</strong>
              <p className="text-gray-500 text-sm">{rec.place.address}</p>
              <p className="text-gray-600 mt-2">Try: {rec.dishes.join(", ")}</p>
              {rec.isSponsored && (
                <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Sponsored
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

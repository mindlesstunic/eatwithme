/**
 * Map Component
 * 
 * Full-page map with markers and swipeable bottom cards.
 * Uses viewport height for immersive discovery experience.
 */

"use client";

import { useState, useEffect } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { track } from "@/lib/track";
import Skeleton from "@/components/Skeleton";
import PlaceCards from "@/components/PlaceCards";

type Recommendation = {
  id: string;
  dishes: string[];
  videoUrl?: string | null;
  isSponsored: boolean;
  influencer: {
    displayName: string;
    username: string;
  };
};

type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  recommendations?: Recommendation[];
};

type MapProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
  places?: Place[];
  fullHeight?: boolean;
};

// ============================================
// Inner component that uses the map hook
// ============================================
function MapContent({
  places,
  selectedPlaceId,
  setSelectedPlaceId,
}: {
  places: Place[];
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
}) {
  const map = useMap();

  // ============================================
  // Pan map to selected place
  // ============================================
  useEffect(() => {
    if (map && selectedPlaceId) {
      const place = places.find((p) => p.id === selectedPlaceId);
      if (place) {
        map.panTo({ lat: place.latitude, lng: place.longitude });
      }
    }
  }, [map, selectedPlaceId, places]);

  // ============================================
  // Handle marker click
  // ============================================
  const handleMarkerClick = (place: Place) => {
    setSelectedPlaceId(place.id);
    track({
      type: "marker_click",
      placeId: place.id,
    });
  };

  return (
    <>
      {places.map((place) => {
        const isSelected = place.id === selectedPlaceId;

        return (
          <AdvancedMarker
            key={place.id}
            position={{ lat: place.latitude, lng: place.longitude }}
            title={place.name}
            onClick={() => handleMarkerClick(place)}
          >
            <div
              className={`
                rounded-full border-2 border-white shadow-lg 
                cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? "w-6 h-6 bg-[var(--color-primary)] scale-125"
                    : "w-4 h-4 bg-[var(--color-primary)] hover:scale-110"
                }
              `}
            />
          </AdvancedMarker>
        );
      })}
    </>
  );
}

// ============================================
// Main Map Component
// ============================================
export default function Map({
  center = { lat: 17.385, lng: 78.4867 },
  zoom = 12,
  places = [],
  fullHeight = false,
}: MapProps) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // ============================================
  // Auto-select first place on load
  // ============================================
  useEffect(() => {
    if (places.length > 0 && !selectedPlaceId) {
      setSelectedPlaceId(places[0].id);
    }
  }, [places, selectedPlaceId]);

  if (!apiKey) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-[var(--radius-lg)]">
        Google Maps API key missing
      </div>
    );
  }

  const handleCardSelect = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  // ============================================
  // Height classes based on fullHeight prop
  // ============================================
  const heightClass = fullHeight
    ? "h-[calc(100vh-73px)]" // Full viewport minus header
    : "h-[500px] sm:h-[600px]";

  return (
    <APIProvider apiKey={apiKey}>
      <div className={`w-full ${heightClass} rounded-[var(--radius-lg)] overflow-hidden relative`}>
        {/* Loading skeleton */}
        {!mapLoaded && (
          <div className="absolute inset-0 z-20">
            <Skeleton className="w-full h-full rounded-[var(--radius-lg)]" />
          </div>
        )}

        {/* Google Map */}
        <GoogleMap
          defaultCenter={center}
          defaultZoom={zoom}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
          onTilesLoaded={() => setMapLoaded(true)}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
        >
          <MapContent
            places={places}
            selectedPlaceId={selectedPlaceId}
            setSelectedPlaceId={setSelectedPlaceId}
          />
        </GoogleMap>

        {/* Place Cards Overlay */}
        <PlaceCards
          places={places}
          selectedPlaceId={selectedPlaceId}
          onPlaceSelect={handleCardSelect}
        />
      </div>
    </APIProvider>
  );
}
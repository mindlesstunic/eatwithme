/**
 * Map Component
 *
 * Full-page map with markers and swipeable bottom cards.
 * Supports discovery and influencer modes for different card layouts.
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
  notes?: string | null;
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
  mode?: "discovery" | "influencer";
};

// ============================================
// Inner component that uses the map hook
// ============================================
function MapContent({
  places,
  selectedPlaceId,
  setSelectedPlaceId,
  userLocation,
  showUserMarker,
}: {
  places: Place[];
  selectedPlaceId: string | null;
  setSelectedPlaceId: (id: string | null) => void;
  userLocation: { lat: number; lng: number } | null;
  showUserMarker: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (map && selectedPlaceId) {
      const place = places.find((p) => p.id === selectedPlaceId);
      if (place) {
        map.panTo({ lat: place.latitude, lng: place.longitude });
      }
    }
  }, [map, selectedPlaceId, places]);

  const handleMarkerClick = (place: Place) => {
    setSelectedPlaceId(place.id);
    track({
      type: "marker_click",
      placeId: place.id,
    });
  };

  return (
    <>
      {/* User location marker */}
      {userLocation && showUserMarker && (
        <AdvancedMarker position={userLocation}>
          <div className="relative">
            <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg" />
            <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
          </div>
        </AdvancedMarker>
      )}

      {/* Place markers */}
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
// Current Location Button
// ============================================
function CurrentLocationButton({
  onLocate,
  loading,
}: {
  onLocate: () => void;
  loading: boolean;
}) {
  return (
    <button
      onClick={onLocate}
      disabled={loading}
      className="bg-[var(--color-background)] p-3 rounded-[var(--radius-md)] shadow-md hover:bg-[var(--color-background-secondary)] transition-colors disabled:opacity-50"
      aria-label="Go to current location"
    >
      {loading ? (
        <svg
          className="w-5 h-5 animate-spin text-[var(--color-primary)]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-[var(--color-primary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
          />
        </svg>
      )}
    </button>
  );
}

// ============================================
// Map Controller
// ============================================
function MapController({
  targetLocation,
  onCentered,
}: {
  targetLocation: { lat: number; lng: number } | null;
  onCentered: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (map && targetLocation) {
      map.panTo(targetLocation);
      map.setZoom(15);
      onCentered();
    }
  }, [map, targetLocation, onCentered]);

  return null;
}

// ============================================
// Main Map Component
// ============================================
export default function Map({
  center = { lat: 17.385, lng: 78.4867 },
  zoom = 12,
  places = [],
  fullHeight = false,
  mode = "discovery",
}: MapProps) {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [centerTarget, setCenterTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showUserMarker, setShowUserMarker] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (places.length > 0 && !selectedPlaceId) {
      setSelectedPlaceId(places[0].id);
    }
  }, [places, selectedPlaceId]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setCenterTarget(loc);
        setShowUserMarker(true);
        setLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        alert("Unable to get your location. Please enable location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

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

  const heightClass = fullHeight
    ? "h-[calc(100vh-73px)]"
    : "h-[500px] sm:h-[600px]";

  return (
    <APIProvider apiKey={apiKey}>
      <div className={`w-full ${heightClass} overflow-hidden relative`}>
        {/* Loading skeleton */}
        {!mapLoaded && (
          <div className="absolute inset-0 z-20">
            <Skeleton className="w-full h-full" />
          </div>
        )}

        {/* Google Map */}
        <GoogleMap
          defaultCenter={center}
          defaultZoom={zoom}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
          onTilesLoaded={() => setMapLoaded(true)}
          gestureHandling="greedy"
          fullscreenControl={false}
          zoomControl={false}
          mapTypeControl={true}
          streetViewControl={false}
          clickableIcons={false}
        >
          <MapContent
            places={places}
            selectedPlaceId={selectedPlaceId}
            setSelectedPlaceId={setSelectedPlaceId}
            userLocation={userLocation}
            showUserMarker={showUserMarker}
          />
          <MapController
            targetLocation={centerTarget}
            onCentered={() => setCenterTarget(null)}
          />
        </GoogleMap>

        {/* Current Location Button */}
        <div className="absolute bottom-[220px] right-4 z-20">
          <CurrentLocationButton onLocate={handleLocate} loading={locating} />
        </div>

        {/* Place Cards */}
        <PlaceCards
          places={places}
          selectedPlaceId={selectedPlaceId}
          onPlaceSelect={handleCardSelect}
          mode={mode}
          userLocation={userLocation}
        />
      </div>
    </APIProvider>
  );
}

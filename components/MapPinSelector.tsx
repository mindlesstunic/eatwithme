"use client";

import { useState } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  MapMouseEvent,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

type LocationResult = {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
};

type Props = {
  onLocationSelect: (location: LocationResult) => void;
  initialLat?: number;
  initialLng?: number;
};

function MapWithPin({ onLocationSelect, initialLat, initialLng }: Props) {
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [addressPreview, setAddressPreview] = useState("");

  const geocoding = useMapsLibrary("geocoding");

  const handleMapClick = async (e: MapMouseEvent) => {
    if (!e.detail.latLng || !geocoding) return;

    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    setMarkerPosition({ lat, lng });
    setLoading(true);

    try {
      const geocoder = new geocoding.Geocoder();
      const response = await geocoder.geocode({
        location: { lat, lng },
      });

      if (response.results && response.results[0]) {
        const result = response.results[0];

        // Extract city from address components
        let city = "";
        for (const component of result.address_components) {
          if (component.types.includes("locality")) {
            city = component.long_name;
            break;
          }
          // Fallback to sublocality or administrative area
          if (!city && component.types.includes("sublocality_level_1")) {
            city = component.long_name;
          }
          if (
            !city &&
            component.types.includes("administrative_area_level_2")
          ) {
            city = component.long_name;
          }
        }

        const address = result.formatted_address;
        setAddressPreview(address);

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address,
          city: city || "Unknown",
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">Tap on the map to drop a pin</p>
      <div className="w-full h-[300px] rounded-lg overflow-hidden border">
        <GoogleMap
          defaultCenter={{ lat: initialLat!, lng: initialLng! }}
          defaultZoom={13}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
          onClick={handleMapClick}
          clickableIcons={false}
        >
          {markerPosition && (
            <AdvancedMarker position={markerPosition}>
              <div className="w-6 h-6 bg-red-500 border-2 border-white rounded-full shadow-lg" />
            </AdvancedMarker>
          )}
        </GoogleMap>
      </div>
      {loading && <p className="text-xs text-gray-400">Getting address...</p>}
      {!loading && addressPreview && (
        <p className="text-xs text-gray-600">{addressPreview}</p>
      )}
    </div>
  );
}

export default function MapPinSelector({
  onLocationSelect,
  initialLat = 17.385,
  initialLng = 78.4867,
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        Google Maps API key missing
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <MapWithPin
        onLocationSelect={onLocationSelect}
        initialLat={initialLat}
        initialLng={initialLng}
      />
    </APIProvider>
  );
}

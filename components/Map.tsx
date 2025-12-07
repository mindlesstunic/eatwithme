"use client";

import { useState } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  Marker,
  InfoWindow,
} from "@vis.gl/react-google-maps";

type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

type MapProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
  places?: Place[];
};

export default function Map({
  center = { lat: 17.385, lng: 78.4867 },
  zoom = 12,
  places = [],
}: MapProps) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="p-4 bg-red-100 text-red-700">
        Google Maps API key missing
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-[400px] rounded-lg overflow-hidden">
        <GoogleMap
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="eatwithme-map"
          onClick={() => setSelectedPlace(null)}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              position={{ lat: place.latitude, lng: place.longitude }}
              title={place.name}
              onClick={() => setSelectedPlace(place)}
            />
          ))}

          {selectedPlace && (
            <InfoWindow
              position={{
                lat: selectedPlace.latitude,
                lng: selectedPlace.longitude,
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-1">
                <h3 className="font-semibold">{selectedPlace.name}</h3>
                <p className="text-sm text-gray-600">{selectedPlace.address}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </APIProvider>
  );
}

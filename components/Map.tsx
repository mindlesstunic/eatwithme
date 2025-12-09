"use client";

import { useState } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";

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
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
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
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
          onClick={() => setSelectedPlace(null)}
        >
          {places.map((place) => (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.latitude, lng: place.longitude }}
              title={place.name}
              onClick={() => setSelectedPlace(place)}
            >
              <div className="w-4 h-4 bg-red-500 border-2 border-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform" />
            </AdvancedMarker>
          ))}

          {selectedPlace && (
            <InfoWindow
              position={{
                lat: selectedPlace.latitude,
                lng: selectedPlace.longitude,
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-1 max-w-[280px]">
                <h3 className="font-semibold text-base">
                  {selectedPlace.name}
                </h3>

                {/* Get Directions */}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.latitude},${selectedPlace.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline inline-block mt-1"
                >
                  Get directions →
                </a>

                {selectedPlace.recommendations &&
                  selectedPlace.recommendations.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {selectedPlace.recommendations.map((rec) => (
                        <div key={rec.id} className="pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              @{rec.influencer.username}
                            </span>
                            {rec.isSponsored && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                                Sponsored
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Try: {rec.dishes.join(", ")}
                          </p>
                          {rec.videoUrl && (
                            <a
                              href={rec.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                            >
                              Watch video →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </APIProvider>
  );
}

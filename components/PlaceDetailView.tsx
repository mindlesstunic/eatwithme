"use client";

import { track } from "@/lib/track";

type Recommendation = {
  id: string;
  dishes: string[];
  videoUrl: string | null;
  isSponsored: boolean;
  notes: string | null;
  influencer: {
    id: string;
    username: string;
    displayName: string;
  };
};

type Place = {
  id: string;
  name: string;
  address: string;
  city: string;
  category: string;
  latitude: number;
  longitude: number;
  locationNotes: string | null;
  recommendations: Recommendation[];
};

type Props = {
  place: Place;
};

const categoryLabels: Record<string, string> = {
  street_food: "Street Food",
  casual: "Casual",
  restaurant: "Restaurant",
};

export default function PlaceDetailView({ place }: Props) {
  const handleDirectionClick = () => {
    track({
      type: "direction_click",
      placeId: place.id,
    });
  };

  const handleVideoClick = (rec: Recommendation) => {
    track({
      type: "video_click",
      placeId: place.id,
      influencerId: rec.influencer.id,
      recommendationId: rec.id,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{place.name}</h1>
          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {categoryLabels[place.category] || place.category}
          </span>
        </div>
        <p className="text-gray-500">{place.address}</p>
        <p className="text-gray-400 text-sm">{place.city}</p>
        {place.locationNotes && (
          <p className="text-gray-500 text-sm mt-1 italic">
            📍 {place.locationNotes}
          </p>
        )}
      </div>

      {/* Get Directions */}

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleDirectionClick}
        className="inline-block px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 mb-8"
      >
        Get Directions →
      </a>

      {/* Recommendations */}
      <h2 className="text-xl font-semibold mb-4">
        {place.recommendations.length} Recommendation
        {place.recommendations.length !== 1 && "s"}
      </h2>

      <div className="space-y-4">
        {place.recommendations.map((rec) => (
          <div key={rec.id} className="border p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <a
                href={`/@${rec.influencer.username}`}
                className="font-medium hover:underline"
              >
                @{rec.influencer.username}
              </a>
              {rec.isSponsored && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                  Sponsored
                </span>
              )}
            </div>

            <p className="text-gray-600">Try: {rec.dishes.join(", ")}</p>

            {rec.notes && (
              <p className="text-gray-500 text-sm mt-2 italic">"{rec.notes}"</p>
            )}

            {rec.videoUrl && (
              <a
                href={rec.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleVideoClick(rec)}
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Watch video →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

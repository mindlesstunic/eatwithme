"use client";

import { useState, useEffect } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

type PlaceResult = {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  googlePlaceId: string;
};

type Props = {
  onPlaceSelect: (place: PlaceResult) => void;
};

export default function PlaceAutocomplete({ onPlaceSelect }: Props) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const places = useMapsLibrary("places");

  const handleInputChange = async (value: string) => {
    setInput(value);

    if (!value || value.length < 3 || !places) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);

    try {
      const { suggestions } =
        await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value,
        });

      setSuggestions(suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!suggestion.placePrediction) return;

    try {
      const place = suggestion.placePrediction.toPlace();

      const { place: placeDetails } = await place.fetchFields({
        fields: [
          "displayName",
          "formattedAddress",
          "location",
          "addressComponents",
          "id",
        ],
      });

      // Extract city from address components
      let city = "";
      placeDetails.addressComponents?.forEach((component) => {
        if (component.types.includes("locality")) {
          city = component.longText || "";
        }
      });

      if (!placeDetails.location) {
        console.error("No location found");
        return;
      }

      const result: PlaceResult = {
        name:
          placeDetails.displayName ||
          suggestion.placePrediction.mainText?.text ||
          "",
        address: placeDetails.formattedAddress || "",
        city: city || "Unknown",
        latitude: placeDetails.location.lat(),
        longitude: placeDetails.location.lng(),
        googlePlaceId: placeDetails.id || "",
      };

      onPlaceSelect(result);
      setInput(result.name);
      setShowSuggestions(false);
    } catch (error) {
      console.error("Place details error:", error);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="w-full p-3 border rounded-lg"
        placeholder="Search for a restaurant, cafe, etc."
      />

      {loading && <p className="text-sm text-gray-400 mt-1">Searching...</p>}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.placePrediction?.placeId || index}
              onClick={() => handleSelectPlace(suggestion)}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
            >
              <p className="font-medium">
                {suggestion.placePrediction?.mainText?.text}
              </p>
              <p className="text-sm text-gray-500">
                {suggestion.placePrediction?.secondaryText?.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APIProvider } from "@vis.gl/react-google-maps";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import MapPinSelector from "@/components/MapPinSelector";

export default function AddPlacePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualEntry, setManualEntry] = useState(false);

  // Place fields
  const [placeName, setPlaceName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationNotes, setLocationNotes] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [category, setCategory] = useState("restaurant");

  // Recommendation fields
  const [dishes, setDishes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSponsored, setIsSponsored] = useState(false);
  const [notes, setNotes] = useState("");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handlePlaceSelect = (place: {
    name: string;
    address: string;
    area: string;
    city: string;
    latitude: number;
    longitude: number;
    googlePlaceId: string;
  }) => {
    setPlaceName(place.name);
    setAddress(place.address);
    setArea(place.area);
    setCity(place.city);
    setLatitude(place.latitude.toString());
    setLongitude(place.longitude.toString());
    setGooglePlaceId(place.googlePlaceId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/recommendation/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place: {
          name: placeName,
          address,
          area,
          city,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          locationNotes: locationNotes || null,
          googlePlaceId: googlePlaceId || null,
          category,
        },
        recommendation: {
          dishes: dishes
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean),
          videoUrl: videoUrl || null,
          isSponsored,
          notes: notes || null,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add a Place</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Place Search */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Find the Place</h2>

          {!manualEntry ? (
            <>
              {apiKey ? (
                <APIProvider apiKey={apiKey}>
                  <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
                </APIProvider>
              ) : (
                <p className="text-red-500">Google Maps API key missing</p>
              )}

              {placeName && (
                <div className="p-4 bg-[var(--color-background-secondary)] rounded-lg flex items-start justify-between">
                  <div>
                    <p className="font-medium">{placeName}</p>
                    <p className="text-sm text-[var(--color-foreground-secondary)]">
                      {address}
                    </p>
                    <p className="text-xs text-[var(--color-foreground-muted)]">
                      {city} • {latitude}, {longitude}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaceName("");
                      setAddress("");
                      setCity("");
                      setLatitude("");
                      setLongitude("");
                      setGooglePlaceId("");
                      setLocationNotes("");
                    }}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setManualEntry(true)}
                className="text-sm text-[var(--color-foreground-secondary)] underline"
              >
                Can't find it? Enter manually
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Place Name *
                </label>
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Bawarchi Restaurant"
                  required
                />
              </div>

              <MapPinSelector
                onLocationSelect={(location) => {
                  setLatitude(location.latitude.toString());
                  setLongitude(location.longitude.toString());
                  setAddress(location.address);
                  setCity(location.city);
                }}
              />

              {/* Auto-filled from pin - editable if needed */}
              {(address || city) && (
                <div className="p-4 bg-[var(--color-background-secondary)] rounded-lg space-y-3">
                  <div>
                    <label className="block text-xs text-[var(--color-foreground-secondary)] mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-foreground-secondary)] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                    />
                  </div>
                  <p className="text-xs text-[var(--color-foreground-muted)]">
                    {latitude}, {longitude}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Location Notes
                </label>
                <input
                  type="text"
                  value={locationNotes}
                  onChange={(e) => setLocationNotes(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Near the bus stop, opposite HDFC bank"
                />
              </div>

              <button
                type="button"
                onClick={() => setManualEntry(false)}
                className="text-sm text-[var(--color-foreground-secondary)] underline"
              >
                ← Back to search
              </button>
            </>
          )}
        </section>
        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white"
          >
            <option value="street_food">Street Food</option>
            <option value="casual">Casual</option>
            <option value="restaurant">Restaurant</option>
          </select>
        </div>

        {/* Recommendation Details */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Your Recommendation</h2>

          <div>
            <label className="block text-sm font-medium mb-1">
              Dishes to Try *
            </label>
            <input
              type="text"
              value={dishes}
              onChange={(e) => setDishes(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Biryani, Haleem, Double Ka Meetha"
              required
            />
            <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
              Separate multiple dishes with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Video URL</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Go before 7pm for fresh biryani. Ask for extra mirchi!"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sponsored"
              checked={isSponsored}
              onChange={(e) => setIsSponsored(e.target.checked)}
              className="w-5 h-5"
            />
            <label htmlFor="sponsored" className="text-sm">
              This is a sponsored recommendation
            </label>
          </div>
        </section>

        {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border rounded-lg font-medium hover:bg-[var(--color-background-secondary)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !placeName || !dishes}
            className="flex-1 p-3 btn-primary rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Place"}
          </button>
        </div>
      </form>
    </main>
  );
}

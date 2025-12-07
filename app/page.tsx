import { prisma } from "@/lib/db";
import Map from "@/components/Map";

export default async function Home() {
  const places = await prisma.place.findMany({
    include: {
      recommendations: {
        include: {
          influencer: true,
        },
      },
    },
  });

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">EatWithMe</h1>
      <p className="text-gray-500 mb-4">Discover great food near you</p>

      <Map
        places={places.map((p) => ({
          id: p.id,
          name: p.name,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
        }))}
      />

      <h2 className="text-xl font-semibold mb-4 mt-8">
        All Places ({places.length})
      </h2>

      <div className="space-y-4">
        {places.map((place) => (
          <div key={place.id} className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">{place.name}</h3>
            <p className="text-gray-500 text-sm">{place.address}</p>
            <p className="text-gray-400 text-xs">{place.city}</p>

            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-600">
                Recommended by {place.recommendations.length} influencer(s)
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
    </main>
  );
}

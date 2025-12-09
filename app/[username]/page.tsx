import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Map from "@/components/Map";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function InfluencerPage({ params }: Props) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const cleanUsername = decodedUsername.replace("@", "");

  const influencer = await prisma.influencer.findUnique({
    where: { username: cleanUsername },
    include: {
      recommendations: {
        include: {
          place: true,
        },
      },
    },
  });

  if (!influencer) {
    notFound();
  }

  const places = influencer.recommendations.map((rec) => ({
    id: rec.place.id,
    name: rec.place.name,
    address: rec.place.address,
    latitude: rec.place.latitude,
    longitude: rec.place.longitude,
  }));

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">{influencer.displayName}</h1>
      <p className="text-gray-500">{influencer.username}</p>
      <p className="mt-2 mb-4">{influencer.bio}</p>

      <Map places={places} />

      <h2 className="text-xl font-semibold mt-8 mb-4">
        Recommendations ({influencer.recommendations.length})
      </h2>

      {influencer.recommendations.length === 0 ? (
        <p className="text-gray-500">No recommendations yet</p>
      ) : (
        <ul className="space-y-4">
          {influencer.recommendations.map((rec) => (
            <li key={rec.id} className="border p-4 rounded-lg">
              <strong className="text-lg">{rec.place.name}</strong>
              <br />
              <span className="text-gray-600">
                Try: {rec.dishes.join(", ")}
              </span>
              {rec.isSponsored && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Sponsored
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

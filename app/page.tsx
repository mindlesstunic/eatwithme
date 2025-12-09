import { prisma } from "@/lib/db";
import DiscoveryView from "@/components/DiscoveryView";

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
      <p className="text-gray-500 mb-6">Discover great food near you</p>

      <DiscoveryView places={places} />
    </main>
  );
}

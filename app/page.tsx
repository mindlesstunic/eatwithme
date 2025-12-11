/**
 * Homepage
 *
 * Discovery page showing all places from all influencers.
 * Full-page map view for immersive discovery.
 */

import { prisma } from "@/lib/db";
import DiscoveryView from "@/components/DiscoveryView";

export const revalidate = 60;

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
  const placesWithArea = places.map((place) => ({
    ...place,
    area: place.area ?? undefined,
  }));

  return <DiscoveryView places={placesWithArea} />;
}

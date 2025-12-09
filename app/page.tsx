/**
 * Homepage
 * 
 * Discovery page showing all places from all influencers.
 * Full-page map view for immersive discovery.
 */

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

  return <DiscoveryView places={places} />;
}
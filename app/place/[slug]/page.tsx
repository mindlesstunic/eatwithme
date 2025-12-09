import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PageViewTracker from "@/components/PageViewTracker";
import PlaceDetailView from "@/components/PlaceDetailView";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PlacePage({ params }: Props) {
  const { slug } = await params;

  const place = await prisma.place.findUnique({
    where: { id: slug },
    include: {
      recommendations: {
        include: {
          influencer: true,
        },
      },
    },
  });

  if (!place) {
    notFound();
  }

  return (
    <main className="p-6">
      <PageViewTracker placeId={place.id} />
      <PlaceDetailView place={place} />
    </main>
  );
}

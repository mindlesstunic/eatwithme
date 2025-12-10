/**
 * Place Detail Page
 *
 * Shows all recommendations for a specific place.
 */

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PageViewTracker from "@/components/PageViewTracker";
import PlaceDetailView from "@/components/PlaceDetailView";

type Props = {
  params: Promise<{ slug: string }>;
};

// ============================================
// Dynamic Metadata
// ============================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const place = await prisma.place.findUnique({
    where: { id: slug },
    include: {
      _count: {
        select: { recommendations: true },
      },
    },
  });

  if (!place) {
    return {
      title: "Place Not Found",
    };
  }

  const recCount = place._count.recommendations;

  return {
    title: place.name,
    description: `${place.name} in ${place.city} - ${recCount} recommendation${
      recCount !== 1 ? "s" : ""
    } from food influencers on EatWithMe.`,
    openGraph: {
      title: `${place.name} | EatWithMe`,
      description: `${recCount} recommendation${
        recCount !== 1 ? "s" : ""
      } for ${place.name} in ${place.city}`,
      type: "article",
      url: `https://eatwithme.app/place/${place.id}`,
    },
    twitter: {
      card: "summary",
      title: `${place.name} | EatWithMe`,
      description: `${recCount} recommendation${
        recCount !== 1 ? "s" : ""
      } for ${place.name} in ${place.city}`,
    },
  };
}

// ============================================
// Page Component
// ============================================
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
    <main className="p-4 sm:p-6 max-w-3xl mx-auto">
      <PageViewTracker placeId={place.id} />
      <PlaceDetailView place={place} />
    </main>
  );
}

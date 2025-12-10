/**
 * Influencer Public Page
 *
 * Shows an influencer's profile and all their recommendations.
 * Full-page map view with swipeable cards.
 */

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import InfluencerView from "@/components/InfluencerView";
import PageViewTracker from "@/components/PageViewTracker";

type Props = {
  params: Promise<{ username: string }>;
};

// ============================================
// Dynamic Metadata
// ============================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username).replace("@", "");

  const influencer = await prisma.influencer.findUnique({
    where: { username: cleanUsername },
    include: {
      _count: {
        select: { recommendations: true },
      },
    },
  });

  if (!influencer) {
    return {
      title: "Influencer Not Found",
    };
  }

  const placeCount = influencer._count.recommendations;

  return {
    title: `${influencer.displayName} (@${influencer.username})`,
    description:
      influencer.bio ||
      `Check out ${influencer.displayName}'s ${placeCount} food recommendation${
        placeCount !== 1 ? "s" : ""
      } on EatWithMe.`,
    openGraph: {
      title: `${influencer.displayName} on EatWithMe`,
      description:
        influencer.bio ||
        `${placeCount} food recommendation${placeCount !== 1 ? "s" : ""} from ${
          influencer.displayName
        }`,
      type: "profile",
      url: `https://eatwithme.app/@${influencer.username}`,
    },
    twitter: {
      card: "summary",
      title: `${influencer.displayName} on EatWithMe`,
      description:
        influencer.bio ||
        `${placeCount} food recommendation${placeCount !== 1 ? "s" : ""} from ${
          influencer.displayName
        }`,
    },
  };
}

// ============================================
// Page Component
// ============================================
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

  const recommendationsWithInfluencer = influencer.recommendations.map(
    (rec) => ({
      ...rec,
      influencer: {
        id: influencer.id,
        displayName: influencer.displayName,
        username: influencer.username,
      },
    })
  );

  return (
    <>
      <PageViewTracker influencerId={influencer.id} />
      <InfluencerView
        recommendations={recommendationsWithInfluencer}
        influencer={{
          id: influencer.id,
          displayName: influencer.displayName,
          username: influencer.username,
          bio: influencer.bio,
          instagram: influencer.instagram,
          youtube: influencer.youtube,
        }}
      />
    </>
  );
}

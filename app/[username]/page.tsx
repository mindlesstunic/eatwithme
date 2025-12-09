import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import InfluencerView from "@/components/InfluencerView";

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

  // Add influencer info to each recommendation for the view
  const recommendationsWithInfluencer = influencer.recommendations.map(
    (rec) => ({
      ...rec,
      influencer: {
        displayName: influencer.displayName,
        username: influencer.username,
      },
    })
  );

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">{influencer.displayName}</h1>
      <p className="text-gray-500">@{influencer.username}</p>
      {influencer.bio && <p className="mt-2">{influencer.bio}</p>}

      <div className="mt-6">
        <InfluencerView
          recommendations={recommendationsWithInfluencer}
          influencer={{
            displayName: influencer.displayName,
            username: influencer.username,
          }}
        />
      </div>
    </main>
  );
}

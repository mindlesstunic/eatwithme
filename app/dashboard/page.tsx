import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import SetupProfile from "./SetupProfile";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const influencer = await prisma.influencer.findUnique({
    where: { authId: user.id },
    include: {
      recommendations: {
        include: {
          place: true,
        },
      },
    },
  });

  if (!influencer) {
    return <SetupProfile userId={user.id} email={user.email || ""} />;
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Welcome, {influencer.displayName}!</h1>
      <p className="text-gray-500 mt-2">
        Your page:{" "}
        <a href={`/@${influencer.username}`} className="underline">
          eatwithme.app/@{influencer.username}
        </a>
      </p>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Your Recommendations ({influencer.recommendations.length})
          </h2>
          <Link
            href="/dashboard/add-place"
            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
          >
            + Add Place
          </Link>
        </div>

        {influencer.recommendations.length === 0 ? (
          <p className="text-gray-500">
            No recommendations yet. Add your first place!
          </p>
        ) : (
          <div className="space-y-4">
            {influencer.recommendations.map((rec) => (
              <div key={rec.id} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{rec.place.name}</h3>
                <p className="text-gray-500 text-sm">{rec.place.address}</p>
                <p className="text-gray-600 mt-2">
                  Dishes: {rec.dishes.join(", ")}
                </p>
                {rec.isSponsored && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Sponsored
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

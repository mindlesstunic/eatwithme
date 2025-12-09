/**
 * Influencer Dashboard
 *
 * Shows profile setup for new users, or the dashboard with
 * all recommendations and management options for existing users.
 */

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import SetupProfile from "./SetupProfile";
import Link from "next/link";
import RecommendationCard from "./RecommendationCard";

export default async function DashboardPage() {
  // ============================================
  // 1. Verify authentication
  // ============================================
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ============================================
  // 2. Get influencer profile with recommendations
  // ============================================
  const influencer = await prisma.influencer.findUnique({
    where: { authId: user.id },
    include: {
      recommendations: {
        include: {
          place: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  // ============================================
  // 3. Show setup form if no profile exists
  // ============================================
  if (!influencer) {
    return <SetupProfile userId={user.id} email={user.email || ""} />;
  }

  // ============================================
  // 4. Render dashboard
  // ============================================
  return (
    <main className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold">Welcome, {influencer.displayName}!</h1>
      <p className="text-gray-500 mt-2">
        Your page:{" "}
        <a href={`/@${influencer.username}`} className="underline">
          eatwithme.app/@{influencer.username}
        </a>
      </p>

      {/* Recommendations Section */}
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

        {/* Empty State */}
        {influencer.recommendations.length === 0 ? (
          <p className="text-gray-500">
            No recommendations yet. Add your first place!
          </p>
        ) : (
          /* Recommendations List */
          <div className="space-y-4">
            {influencer.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * Edit Recommendation Page
 *
 * Allows influencers to edit their existing recommendations.
 * Pre-fills form with current data and saves changes via API.
 */

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditRecommendationForm from "./EditRecommendationForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditRecommendationPage({ params }: Props) {
  const { id } = await params;

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
  // 2. Get influencer profile
  // ============================================
  const influencer = await prisma.influencer.findUnique({
    where: { authId: user.id },
  });

  if (!influencer) {
    redirect("/dashboard");
  }

  // ============================================
  // 3. Get recommendation with place data
  // ============================================
  const recommendation = await prisma.recommendation.findUnique({
    where: { id },
    include: {
      place: true,
    },
  });

  // ============================================
  // 4. Verify recommendation exists and is owned by user
  // ============================================
  if (!recommendation) {
    notFound();
  }

  if (recommendation.influencerId !== influencer.id) {
    redirect("/dashboard");
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Edit Recommendation</h1>
      <p className="text-[var(--color-foreground-secondary)] mb-8">
        {recommendation.place.name}
      </p>

      <EditRecommendationForm recommendation={recommendation} />
    </main>
  );
}

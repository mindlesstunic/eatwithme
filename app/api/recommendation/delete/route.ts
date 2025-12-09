/**
 * DELETE /api/recommendation/delete
 *
 * Deletes a recommendation owned by the logged-in influencer.
 * Also cleans up orphaned places (places with no recommendations).
 */

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // ============================================
    // 1. Verify the user is authenticated
    // ============================================
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ============================================
    // 2. Get the influencer profile
    // ============================================
    const influencer = await prisma.influencer.findUnique({
      where: { authId: user.id },
    });

    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer profile not found" },
        { status: 404 }
      );
    }

    // ============================================
    // 3. Get recommendation ID from request
    // ============================================
    const { recommendationId } = await request.json();

    if (!recommendationId) {
      return NextResponse.json(
        { error: "Recommendation ID required" },
        { status: 400 }
      );
    }

    // ============================================
    // 4. Verify ownership - only delete own recommendations
    // ============================================
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: "Recommendation not found" },
        { status: 404 }
      );
    }

    if (recommendation.influencerId !== influencer.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this recommendation" },
        { status: 403 }
      );
    }

    // ============================================
    // 5. Store placeId before deleting
    // ============================================
    const placeId = recommendation.placeId;

    // ============================================
    // 6. Delete the recommendation
    // ============================================
    await prisma.recommendation.delete({
      where: { id: recommendationId },
    });

    // ============================================
    // 7. Check if place has any other recommendations
    // ============================================
    const remainingRecommendations = await prisma.recommendation.count({
      where: { placeId },
    });

    // ============================================
    // 8. Delete place if no recommendations left
    // ============================================
    if (remainingRecommendations === 0) {
      // First delete any events referencing this place
      await prisma.event.deleteMany({
        where: { placeId },
      });

      // Then delete the place
      await prisma.place.delete({
        where: { id: placeId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recommendation:", error);
    return NextResponse.json(
      { error: "Failed to delete recommendation" },
      { status: 500 }
    );
  }
}

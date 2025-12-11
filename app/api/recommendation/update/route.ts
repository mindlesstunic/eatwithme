/**
 * POST /api/recommendation/update
 *
 * Updates a recommendation owned by the logged-in influencer.
 * Can update dishes, video URL, sponsored status, and notes.
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
    // 3. Parse request body
    // ============================================
    const {
      recommendationId,
      dishes,
      videoUrl,
      hasOffer,
      offerDetails,
      offerExpiry,
      notes,
    } = await request.json();

    if (!recommendationId) {
      return NextResponse.json(
        { error: "Recommendation ID required" },
        { status: 400 }
      );
    }

    if (!dishes || dishes.length === 0) {
      return NextResponse.json(
        { error: "At least one dish is required" },
        { status: 400 }
      );
    }

    // ============================================
    // 4. Verify ownership
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
        { error: "Not authorized to edit this recommendation" },
        { status: 403 }
      );
    }

    // ============================================
    // 5. Update the recommendation
    // ============================================
    const updated = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        dishes,
        videoUrl: videoUrl || null,
        hasOffer: hasOffer || false,
        offerDetails: hasOffer ? offerDetails || null : null,
        offerExpiry: hasOffer && offerExpiry ? new Date(offerExpiry) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ recommendation: updated });
  } catch (error) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to update recommendation" },
      { status: 500 }
    );
  }
}

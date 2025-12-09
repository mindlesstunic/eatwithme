/**
 * POST /api/influencer/update
 *
 * Updates the logged-in influencer's profile.
 * Can update display name, bio, and social links.
 * Username cannot be changed after creation.
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
    const { displayName, bio, instagram, youtube } = await request.json();

    if (!displayName || displayName.trim() === "") {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 }
      );
    }

    // ============================================
    // 4. Update the profile
    // ============================================
    const updated = await prisma.influencer.update({
      where: { id: influencer.id },
      data: {
        displayName: displayName.trim(),
        bio: bio?.trim() || null,
        instagram: instagram?.replace("@", "").trim() || null,
        youtube: youtube?.trim() || null,
      },
    });

    return NextResponse.json({ influencer: updated });
  } catch (error) {
    console.error("Error updating influencer:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

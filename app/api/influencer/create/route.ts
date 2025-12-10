import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Reserved usernames that could conflict with routes
const RESERVED_USERNAMES = [
  "admin",
  "api",
  "dashboard",
  "login",
  "logout",
  "signup",
  "auth",
  "place",
  "places",
  "settings",
  "profile",
  "help",
  "support",
  "about",
  "terms",
  "privacy",
  "search",
  "discover",
  "explore",
  "app",
  "www",
  "null",
  "undefined",
];

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

    const { username, displayName, instagram, youtube } = await request.json();

    // ============================================
    // 2. Validate required fields
    // ============================================
    if (!username || !displayName) {
      return NextResponse.json(
        { error: "Username and display name are required" },
        { status: 400 }
      );
    }

    // ============================================
    // 3. Validate username format
    // ============================================
    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return NextResponse.json(
        { error: "Username must be 3-30 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json(
        {
          error: "Username can only contain letters, numbers, and underscores",
        },
        { status: 400 }
      );
    }

    if (cleanUsername.startsWith("_") || cleanUsername.endsWith("_")) {
      return NextResponse.json(
        { error: "Username cannot start or end with underscore" },
        { status: 400 }
      );
    }

    // ============================================
    // 4. Check reserved usernames
    // ============================================
    if (RESERVED_USERNAMES.includes(cleanUsername)) {
      return NextResponse.json(
        { error: "This username is reserved" },
        { status: 400 }
      );
    }

    // ============================================
    // 5. Check if user already has a profile
    // ============================================
    const existingProfile = await prisma.influencer.findUnique({
      where: { authId: user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "You already have a profile" },
        { status: 400 }
      );
    }

    // ============================================
    // 6. Check if username is taken
    // ============================================
    const existingUsername = await prisma.influencer.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // ============================================
    // 7. Create influencer (using authenticated user's ID)
    // ============================================
    const influencer = await prisma.influencer.create({
      data: {
        authId: user.id, // Use the authenticated user's ID, not from request
        username: cleanUsername,
        displayName: displayName.trim().slice(0, 100),
        instagram: instagram?.replace("@", "").trim().slice(0, 50) || null,
        youtube: youtube?.trim().slice(0, 200) || null,
      },
    });

    return NextResponse.json({ influencer });
  } catch (error) {
    console.error("Error creating influencer:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

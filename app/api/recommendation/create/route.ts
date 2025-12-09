import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get logged-in user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get influencer profile
    const influencer = await prisma.influencer.findUnique({
      where: { authId: user.id },
    });

    if (!influencer) {
      return NextResponse.json(
        { error: "Influencer profile not found" },
        { status: 404 }
      );
    }

    const { place, recommendation } = await request.json();

    // Validate input
    if (
      !place.name ||
      !place.address ||
      !place.city ||
      !place.latitude ||
      !place.longitude
    ) {
      return NextResponse.json(
        { error: "Missing place details" },
        { status: 400 }
      );
    }

    if (!recommendation.dishes || recommendation.dishes.length === 0) {
      return NextResponse.json(
        { error: "At least one dish is required" },
        { status: 400 }
      );
    }

    // Check if place already exists (by name and city)
    let existingPlace = await prisma.place.findFirst({
      where: {
        name: place.name,
        city: place.city,
      },
    });

    // Create place if it doesn't exist
    if (!existingPlace) {
      existingPlace = await prisma.place.create({
        data: {
          name: place.name,
          address: place.address,
          city: place.city,
          latitude: place.latitude,
          longitude: place.longitude,
          locationNotes: place.locationNotes,
          category: place.category || "restaurant",
        },
      });
    }

    // Create recommendation
    const newRecommendation = await prisma.recommendation.create({
      data: {
        dishes: recommendation.dishes,
        videoUrl: recommendation.videoUrl,
        isSponsored: recommendation.isSponsored || false,
        notes: recommendation.notes,
        influencerId: influencer.id,
        placeId: existingPlace.id,
      },
    });

    return NextResponse.json({
      recommendation: newRecommendation,
      place: existingPlace,
    });
  } catch (error) {
    console.error("Error creating recommendation:", error);
    return NextResponse.json(
      { error: "Failed to create recommendation" },
      { status: 500 }
    );
  }
}

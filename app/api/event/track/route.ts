import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      type,
      placeId,
      influencerId,
      recommendationId,
      sessionId,
      metadata,
    } = await request.json();

    if (!type || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await prisma.event.create({
      data: {
        type,
        placeId: placeId || null,
        influencerId: influencerId || null,
        recommendationId: recommendationId || null,
        sessionId,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Event tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

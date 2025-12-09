import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const events = await prisma.event.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ count: events.length, events });
}

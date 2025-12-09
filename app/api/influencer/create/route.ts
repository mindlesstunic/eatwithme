import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, username, displayName, instagram, youtube } = await request.json()

    // Validate input
    if (!userId || !username || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if username already taken
    const existing = await prisma.influencer.findUnique({
      where: { username }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    // Create influencer
    const influencer = await prisma.influencer.create({
      data: {
        authId: userId,
        username,
        displayName,
        instagram: instagram || null,
        youtube: youtube || null,
      }
    })

    return NextResponse.json({ influencer })

  } catch (error) {
    console.error('Error creating influencer:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}
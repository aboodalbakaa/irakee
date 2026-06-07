import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/suggestions — Get suggested users to follow
export async function GET(req: NextRequest) {
  try {
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        userId: true,
        displayName: true,
        profession: true,
        city: true,
        country: true,
        diasporaStatus: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json({ profiles: [] });
  }
}
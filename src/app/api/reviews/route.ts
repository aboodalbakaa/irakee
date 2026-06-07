import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { targetId, listingId, rating, content } = body;

    if (!targetId || rating === undefined) {
      return NextResponse.json(
        { error: "targetId and rating are required" },
        { status: 400 }
      );
    }

    const ratingNum = parseInt(rating, 10);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Don't allow reviewing yourself
    if (targetId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot review yourself" },
        { status: 400 }
      );
    }

    // Check target user exists
    const target = await prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if reviewed already
    const existing = await prisma.review.findFirst({
      where: {
        reviewerId: session.user.id,
        targetId,
        ...(listingId ? { listingId } : { listingId: null }),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this user" },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: session.user.id,
        targetId,
        listingId: listingId || null,
        rating: ratingNum,
        content: content || null,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("[review create]", err);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
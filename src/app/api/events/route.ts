import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const eventType = searchParams.get("eventType");

  const where: Record<string, unknown> = {};
  if (city) where.location = { contains: city, mode: "insensitive" };
  if (eventType) where.eventType = eventType;

  try {
    const events = await prisma.event.findMany({
      where,
      orderBy: { startTime: "desc" },
      include: {
        organizer: { select: { name: true } },
      },
      take: 50,
    });

    return NextResponse.json(events);
  } catch (err) {
    console.error("[events list]", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      eventType,
      location,
      startTime,
      endTime,
      timezone,
      maxAttendees,
      coverImage,
      tags,
      status,
    } = body;

    if (!titleEn || !eventType || !startTime || !endTime) {
      return NextResponse.json(
        { error: "titleEn, eventType, startTime, endTime are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        organizerId: session.user.id,
        titleEn,
        titleAr: titleAr || null,
        descriptionEn: descriptionEn || null,
        descriptionAr: descriptionAr || null,
        eventType,
        location: location || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        timezone: timezone || null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
        coverImage: coverImage || null,
        tags: typeof tags === "string"
          ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : tags || [],
        status: status || "draft",
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("[events create]", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const listingType = searchParams.get("listingType");
  const city = searchParams.get("city");
  const country = searchParams.get("country");

  const where: Record<string, unknown> = {};
  if (listingType) where.listingType = listingType;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (country) where.country = { contains: country, mode: "insensitive" };

  try {
    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        profile: { select: { displayName: true } },
      },
      take: 50,
    });

    return NextResponse.json(listings);
  } catch (err) {
    console.error("[listings list]", err);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Find the user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Complete your profile first" }, { status: 400 });
    }

    const {
      listingType,
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      category,
      subcategory,
      city,
      country,
      priceMin,
      priceMax,
      currency,
      tags,
      media,
      status,
    } = body;

    if (!listingType || !titleEn) {
      return NextResponse.json(
        { error: "listingType and titleEn are required" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        profileId: profile.id,
        listingType,
        titleEn,
        titleAr: titleAr || null,
        descriptionEn: descriptionEn || null,
        descriptionAr: descriptionAr || null,
        category: category || null,
        subcategory: subcategory || null,
        city: city || null,
        country: country || null,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        currency: currency || "USD",
        tags: typeof tags === "string"
          ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : tags || [],
        media: media || [],
        status: status || "active",
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    console.error("[listings create]", err);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
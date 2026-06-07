import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get all profiles with coordinates
    const profiles = await prisma.profile.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            posts: {
              take: 1,
              orderBy: { createdAt: "desc" },
              select: { id: true, createdAt: true },
            },
          },
        },
      },
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const users = profiles.map((p) => ({
      id: p.userId,
      name: p.displayName || p.user.name || "Anonymous",
      profession: p.profession,
      city: p.city,
      country: p.country,
      latitude: p.latitude!,
      longitude: p.longitude!,
      avatarUrl: p.avatarUrl,
      recentPost: p.user.posts.length > 0 && new Date(p.user.posts[0].createdAt) > sevenDaysAgo,
    }));

    // Get events with coordinates
    const events = await prisma.event.findMany({
      where: { status: { not: "cancelled" } },
      select: {
        id: true,
        titleEn: true,
        location: true,
        startTime: true,
        eventType: true,
      },
    });

    // Geocode events by location city
    const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
      "london": { lat: 51.5074, lng: -0.1278 },
      "dubai": { lat: 25.2048, lng: 55.2708 },
      "dearborn": { lat: 42.3223, lng: -83.1763 },
      "berlin": { lat: 52.5200, lng: 13.4050 },
      "manchester": { lat: 53.4808, lng: -2.2426 },
      "baghdad": { lat: 33.3152, lng: 44.3661 },
      "birmingham": { lat: 52.4862, lng: -1.8904 },
      "istanbul": { lat: 41.0082, lng: 28.9784 },
      "erbil": { lat: 36.1911, lng: 44.0091 },
      "new york": { lat: 40.7128, lng: -74.0060 },
      "chicago": { lat: 41.8781, lng: -87.6298 },
      "detroit": { lat: 42.3314, lng: -83.0458 },
      "toronto": { lat: 43.6532, lng: -79.3832 },
      "sydney": { lat: -33.8688, lng: 151.2093 },
    };

    const geocodedEvents = events.map((e) => {
      let lat: number | null = null;
      let lng: number | null = null;
      if (e.location) {
        const loc = e.location.toLowerCase();
        for (const [city, coords] of Object.entries(CITY_COORDS)) {
          if (loc.includes(city)) {
            lat = coords.lat;
            lng = coords.lng;
            break;
          }
        }
      }
      return {
        id: e.id,
        title: e.titleEn,
        location: e.location,
        latitude: lat,
        longitude: lng,
        startTime: e.startTime.toISOString(),
        eventType: e.eventType,
      };
    });

    // Stats
    const totalUsers = await prisma.user.count();
    const cities = new Set(profiles.filter((p) => p.city).map((p) => p.city!.toLowerCase()));
    const countries = new Set(profiles.filter((p) => p.country).map((p) => p.country!.toLowerCase()));
    const totalEvents = await prisma.event.count({ where: { status: { not: "cancelled" } } });

    return NextResponse.json({
      users,
      events: geocodedEvents,
      stats: {
        totalUsers,
        totalCities: cities.size,
        totalCountries: countries.size,
        totalEvents,
      },
    });
  } catch (err) {
    console.error("[map] error:", err);
    return NextResponse.json(
      { users: [], events: [], stats: { totalUsers: 0, totalCities: 0, totalCountries: 0, totalEvents: 0 } },
      { status: 500 }
    );
  }
}
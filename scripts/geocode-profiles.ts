// Geocode all profiles with city/country but no lat/lng
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function geocode(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${city}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "IraqeeApp/1.0 (community platform)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "london": { lat: 51.5074, lng: -0.1278 },
  "dubai": { lat: 25.2048, lng: 55.2708 },
  "dearborn": { lat: 42.3223, lng: -83.1763 },
  "berlin": { lat: 52.5200, lng: 13.4050 },
  "manchester": { lat: 53.4808, lng: -2.2426 },
  "baghdad": { lat: 33.3152, lng: 44.3661 },
  "birmingham": { lat: 52.4862, lng: -1.8904 },
  "amman": { lat: 31.9454, lng: 35.9284 },
  "istanbul": { lat: 41.0082, lng: 28.9784 },
  "erbil": { lat: 36.1911, lng: 44.0091 },
  "basra": { lat: 30.5081, lng: 47.7838 },
  "sydney": { lat: -33.8688, lng: 151.2093 },
  "chicago": { lat: 41.8781, lng: -87.6298 },
  "detroit": { lat: 42.3314, lng: -83.0458 },
  "stockholm": { lat: 59.3293, lng: 18.0686 },
  "toronto": { lat: 43.6532, lng: -79.3832 },
  "paris": { lat: 48.8566, lng: 2.3522 },
};

async function main() {
  const profiles = await prisma.profile.findMany({
    where: {
      city: { not: null },
      country: { not: null },
      latitude: null,
    },
  });

  console.log(`Found ${profiles.length} profiles to geocode...`);

  for (const profile of profiles) {
    const cityLower = profile.city!.toLowerCase();
    const coords = CITY_COORDS[cityLower];

    if (coords) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { latitude: coords.lat, longitude: coords.lng },
      });
      console.log(`  ✓ ${profile.city}, ${profile.country} (cached)`);
    } else {
      const result = await geocode(profile.city!, profile.country!);
      if (result) {
        await prisma.profile.update({
          where: { id: profile.id },
          data: { latitude: result.lat, longitude: result.lng },
        });
        console.log(`  ✓ ${profile.city}, ${profile.country} → (${result.lat}, ${result.lng})`);
        // Rate limit: 1 request per second
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        console.log(`  ✗ ${profile.city}, ${profile.country} — not found`);
      }
    }
  }

  console.log("\n✅ Geocoding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
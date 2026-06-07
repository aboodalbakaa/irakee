"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Loader2, MapPin, Users, Calendar, Activity } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues with Leaflet
const DiasporaMap = dynamic(() => import("@/components/map/DiasporaMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-2xl bg-iraq-navy/5 border border-iraq-sand/30">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-iraq-gold" />
        <p className="text-sm text-iraq-stone">Loading map...</p>
      </div>
    </div>
  ),
});

type MapData = {
  users: Array<{
    id: string;
    name: string;
    profession: string | null;
    city: string | null;
    country: string | null;
    latitude: number;
    longitude: number;
    avatarUrl: string | null;
    recentPost: boolean;
  }>;
  events: Array<{
    id: string;
    title: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    startTime: string;
    eventType: string;
  }>;
  stats: {
    totalUsers: number;
    totalCities: number;
    totalCountries: number;
    totalEvents: number;
  };
};

export default function MapPage() {
  const { data: session, status } = useSession();
  const [data, setData] = React.useState<MapData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [layer, setLayer] = React.useState<"members" | "events" | "activity">("members");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/map");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-iraq-cream mesopotamian-pattern">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-iraq-navy to-iraq-navy-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <MapPin className="h-8 w-8 text-iraq-gold" />
                Iraqi Diaspora Map
              </h1>
              <p className="mt-2 text-iraq-stone/80 max-w-xl">
                See where the Iraqi community is active worldwide. Connect with people near you, discover events, and see what's happening.
              </p>
            </div>
            {data && (
              <div className="flex gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-iraq-gold">{data.stats.totalCountries}</p>
                  <p className="text-xs text-iraq-stone">Countries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-iraq-gold">{data.stats.totalCities}</p>
                  <p className="text-xs text-iraq-stone">Cities</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-iraq-gold">{data.stats.totalUsers}</p>
                  <p className="text-xs text-iraq-stone">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-iraq-gold">{data.stats.totalEvents}</p>
                  <p className="text-xs text-iraq-stone">Events</p>
                </div>
              </div>
            )}
          </div>

          {/* Layer selector */}
          <div className="mt-6 flex items-center gap-2 p-1 bg-white/5 rounded-xl backdrop-blur-sm w-fit">
            {[
              { id: "members" as const, label: "Members", icon: Users },
              { id: "events" as const, label: "Events", icon: Calendar },
              { id: "activity" as const, label: "Activity", icon: Activity },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setLayer(item.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  layer === item.id
                    ? "bg-iraq-gold text-iraq-navy shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex h-[600px] items-center justify-center rounded-2xl bg-white border border-iraq-sand/30 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-iraq-gold" />
              <p className="text-sm text-iraq-stone">Loading diaspora data...</p>
            </div>
          </div>
        ) : data ? (
          <DiasporaMap data={data} layer={layer} />
        ) : (
          <div className="flex h-[600px] items-center justify-center rounded-2xl bg-white border border-iraq-sand/30">
            <p className="text-iraq-stone">Failed to load map data</p>
          </div>
        )}

        {/* Bottom info */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-iraq-sand/30 bg-white p-5 shadow-sm">
            <Users className="h-5 w-5 text-iraq-gold mb-2" />
            <h3 className="text-sm font-semibold text-iraq-navy mb-1">Connect Globally</h3>
            <p className="text-xs text-iraq-stone leading-relaxed">
              Find Iraqis in your city or explore communities worldwide. Every pin is a real community member.
            </p>
          </div>
          <div className="rounded-2xl border border-iraq-sand/30 bg-white p-5 shadow-sm">
            <Calendar className="h-5 w-5 text-iraq-gold mb-2" />
            <h3 className="text-sm font-semibold text-iraq-navy mb-1">Discover Events</h3>
            <p className="text-xs text-iraq-stone leading-relaxed">
              Cultural gatherings, professional meetups, and community events — all visible on the map.
            </p>
          </div>
          <div className="rounded-2xl border border-iraq-sand/30 bg-white p-5 shadow-sm">
            <Activity className="h-5 w-5 text-iraq-gold mb-2" />
            <h3 className="text-sm font-semibold text-iraq-navy mb-1">Live Activity</h3>
            <p className="text-xs text-iraq-stone leading-relaxed">
              See recent posts and activity from the community in real-time across the globe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
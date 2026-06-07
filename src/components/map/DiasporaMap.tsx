"use client";

import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon path issue with webpack/next
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom gold marker icon
const goldIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 16px; height: 16px;
    background: linear-gradient(135deg, #D4A843, #F0E0A0);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

const eventIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 24px; height: 24px;
    background: linear-gradient(135deg, #CE1126, #ff4444);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 12px; font-weight: bold;
  ">E</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

const activityIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="
    width: 20px; height: 20px;
    background: linear-gradient(135deg, #007A3D, #00b359);
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
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
  stats: { totalUsers: number; totalCities: number; totalCountries: number; totalEvents: number };
};

type DiasporaMapProps = {
  data: MapData;
  layer: "members" | "events" | "activity";
};

export default function DiasporaMap({ data, layer }: DiasporaMapProps) {
  const [map, setMap] = React.useState<L.Map | null>(null);

  // Center on a reasonable overview
  const center: [number, number] = [30, 35]; // Approx Middle East / Europe center
  const zoom = 3;

  React.useEffect(() => {
    if (!map) return;
    // Small delay to ensure map is ready
    setTimeout(() => map.invalidateSize(), 200);
  }, [map, layer]);

  // Get member markers
  const memberMarkers = data.users.map((user) => (
    <Marker
      key={`user-${user.id}`}
      position={[user.latitude, user.longitude]}
      icon={user.recentPost ? activityIcon : goldIcon}
    >
      <Popup>
        <div className="text-center min-w-[180px]">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-iraq-gold to-amber-600 text-white text-xs font-bold mb-2 shadow-sm">
            {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>
          <p className="font-semibold text-sm text-iraq-navy">{user.name}</p>
          {user.profession && <p className="text-xs text-stone-500">{user.profession}</p>}
          <p className="text-xs text-iraq-stone mt-1">
            {[user.city, user.country].filter(Boolean).join(", ")}
          </p>
          {user.recentPost && (
            <span className="inline-block mt-2 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Recently active
            </span>
          )}
          <a
            href={`/profile/${user.id}`}
            className="block mt-2 text-xs font-medium text-iraq-gold hover:underline"
          >
            View Profile →
          </a>
        </div>
      </Popup>
    </Marker>
  ));

  // Get event markers
  const eventMarkers = data.events
    .filter((e) => e.latitude && e.longitude)
    .map((event) => (
      <Marker
        key={`event-${event.id}`}
        position={[event.latitude!, event.longitude!]}
        icon={eventIcon}
      >
        <Popup>
          <div className="min-w-[200px]">
            <p className="font-semibold text-sm text-iraq-navy">{event.title}</p>
            <div className="mt-2 space-y-1 text-xs text-stone-500">
              {event.location && <p>📍 {event.location}</p>}
              <p>📅 {new Date(event.startTime).toLocaleDateString()}</p>
              <span className="inline-block mt-1 text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {event.eventType.replace("_", " ")}
              </span>
            </div>
            <a
              href={`/events/${event.id}`}
              className="block mt-2 text-xs font-medium text-iraq-gold hover:underline"
            >
              View Event →
            </a>
          </div>
        </Popup>
      </Marker>
    ));

  // Activity heat circles
  const activityMarkers = data.users
    .filter((u) => u.recentPost)
    .map((user) => (
      <CircleMarker
        key={`activity-${user.id}`}
        center={[user.latitude, user.longitude]}
        radius={30}
        pathOptions={{
          color: "#D4A843",
          fillColor: "#D4A843",
          fillOpacity: 0.15,
          weight: 1,
          opacity: 0.4,
        }}
      />
    ));

  const showMembers = layer === "members" || layer === "activity";
  const showEvents = layer === "events" || layer === "activity";

  return (
    <div className="rounded-2xl overflow-hidden border border-iraq-sand/30 shadow-md">
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        style={{ height: "600px", width: "100%" }}
        scrollWheelZoom={true}
        ref={setMap}
      >
        <ZoomControl position="bottomright" />

        {/* Dark-themed map tiles (CartoDB dark) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Activity glow circles */}
        {layer === "activity" && activityMarkers}

        {/* Member pins */}
        {showMembers && memberMarkers}

        {/* Event pins */}
        {showEvents && eventMarkers}
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/90 backdrop-blur-sm border border-stone-200 p-3 shadow-lg text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-iraq-gold to-amber-500 border border-white shadow-sm" />
          <span className="text-stone-600">Community Member</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 border border-white shadow-sm" />
          <span className="text-stone-600">Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border border-white shadow-sm" />
          <span className="text-stone-600">Recently Active</span>
        </div>
      </div>
    </div>
  );
}
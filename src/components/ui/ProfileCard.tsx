"use client";

import { MapPin, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "./Card";
import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  id: string;
  name: string;
  profession?: string | null;
  city?: string | null;
  country?: string | null;
  languages?: string[];
  avatarUrl?: string | null;
  bio?: string | null;
  className?: string;
}

export function ProfileCard({
  id,
  name,
  profession,
  city,
  country,
  languages,
  avatarUrl,
  bio,
  className,
}: ProfileCardProps) {
  const t = useTranslations();

  return (
    <Link href={{ pathname: "/profile/[id]", params: { id } }}>
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:shadow-md hover:border-teal-200",
          className
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-stone-900 group-hover:text-teal-700">
                {name}
              </h3>
              {profession && (
                <p className="truncate text-sm text-stone-500">
                  {profession}
                </p>
              )}
              {(city || country) && (
                <div className="mt-1 flex items-center gap-1 text-xs text-stone-400">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {[city, country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {languages && languages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <Globe className="mr-1 h-3 w-3 text-stone-400" />
                  {languages.map((lang) => (
                    <Badge key={lang} variant="default">
                      {lang}
                    </Badge>
                  ))}
                </div>
              )}
              {bio && (
                <p className="mt-2 line-clamp-2 text-xs text-stone-500">
                  {bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
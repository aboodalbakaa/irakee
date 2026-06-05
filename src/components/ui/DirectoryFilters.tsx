"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "next-intl";

const PROFESSIONS = [
  "Software Engineer",
  "Architect",
  "Physician",
  "Lawyer",
  "Graphic Designer",
  "Civil Engineer",
];

const CITIES = ["London", "Dubai", "Chicago", "Berlin", "Amman", "Birmingham"];
const COUNTRIES = ["UK", "UAE", "USA", "Germany", "Jordan"];

interface DirectoryFiltersProps {
  currentQ?: string;
  currentProfession?: string;
  currentCity?: string;
  currentCountry?: string;
}

export function DirectoryFilters({
  currentQ = "",
  currentProfession = "",
  currentCity = "",
  currentCountry = "",
}: DirectoryFiltersProps) {
  const t = useTranslations("directory");
  const router = useRouter();
  const pathname = usePathname();

  const buildUrl = useCallback(
    (key: string, value: string) => {
      const filters: Record<string, string> = {
        q: currentQ,
        profession: currentProfession,
        city: currentCity,
        country: currentCountry,
      };
      filters[key] = value;

      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) {
        if (v) params.set(k, v);
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, currentQ, currentProfession, currentCity, currentCountry]
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      router.push(buildUrl(key, value));
    },
    [router, buildUrl]
  );

  return (
    <div className="mt-8">
      <div className="relative mx-auto max-w-xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="pl-10 h-12"
          defaultValue={currentQ}
          onChange={(e) => updateFilter("q", e.target.value)}
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <select
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={currentProfession}
          onChange={(e) => updateFilter("profession", e.target.value)}
        >
          <option value="">{t("filterProfession")}</option>
          {PROFESSIONS.map((prof) => (
            <option key={prof} value={prof}>
              {prof}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={currentCity}
          onChange={(e) => updateFilter("city", e.target.value)}
        >
          <option value="">{t("filterCity")}</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={currentCountry}
          onChange={(e) => updateFilter("country", e.target.value)}
        >
          <option value="">{t("filterCountry")}</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

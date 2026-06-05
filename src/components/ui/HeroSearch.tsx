"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";

export function HeroSearch() {
  const t = useTranslations("home");
  const router = useRouter();
  const locale = useLocale();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/${locale}/directory?q=${encodeURIComponent(q)}` : `/${locale}/directory`);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-iraq-gold/60" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-14 w-full rounded-xl border border-iraq-gold/20 bg-iraq-navy-light/80 pl-12 pr-4 text-base text-white placeholder:text-iraq-cream/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-iraq-gold focus:border-iraq-gold"
        />
      </div>
    </form>
  );
}
